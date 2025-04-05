-- Tabla de grados escolares
CREATE TABLE grados (
    id_grado INT PRIMARY KEY AUTO_INCREMENT,
    nombre_grado VARCHAR(50) NOT NULL UNIQUE,
    orden INT NOT NULL UNIQUE COMMENT 'Para ordenamiento jerárquico (1=1ro Primaria, 12=6to Secundaria)'
);

-- Tabla de áreas de competencia
CREATE TABLE areas_competencia (
    id_area INT PRIMARY KEY AUTO_INCREMENT,
    nombre_area VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de niveles/categorías
CREATE TABLE niveles_categoria (
    id_nivel INT PRIMARY KEY AUTO_INCREMENT,
    nombre_nivel VARCHAR(100) NOT NULL,
    id_area INT NOT NULL,
    id_grado_min INT NOT NULL,
    id_grado_max INT NOT NULL,
    FOREIGN KEY (id_area) REFERENCES areas_competencia(id_area),
    FOREIGN KEY (id_grado_min) REFERENCES grados(id_grado),
    FOREIGN KEY (id_grado_max) REFERENCES grados(id_grado),
    UNIQUE KEY (id_area, nombre_nivel)
);

-- Tabla de unidades educativas
CREATE TABLE unidades_educativas (
    id_unidad_educativa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL
);

-- Tabla de tutores legales (obligatorios)
CREATE TABLE tutores_legales (
    id_tutor_legal INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ci VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    parentesco VARCHAR(50) NOT NULL COMMENT 'Padre, Madre, Tutor legal',
    es_el_mismo_estudiante BOOLEAN DEFAULT FALSE
);

-- Tabla de tutores académicos (opcionales)
CREATE TABLE tutores_academicos (
    id_tutor_academico INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ci VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100) NOT NULL
);

-- Tabla de estudiantes
CREATE TABLE estudiantes (
    id_estudiante INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    ci VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    email VARCHAR(100),
    id_unidad_educativa INT NOT NULL,
    id_grado INT NOT NULL,
    id_tutor_legal INT NOT NULL,
    FOREIGN KEY (id_unidad_educativa) REFERENCES unidades_educativas(id_unidad_educativa),
    FOREIGN KEY (id_grado) REFERENCES grados(id_grado),
    FOREIGN KEY (id_tutor_legal) REFERENCES tutores_legales(id_tutor_legal)
);

-- Tabla de convocatorias
CREATE TABLE convocatorias (
    id_convocatoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio_inscripcion DATE NOT NULL,
    fecha_fin_inscripcion DATE NOT NULL,
    max_areas_por_estudiante INT DEFAULT 2,
    estado ENUM('planificada', 'abierta', 'cerrada', 'finalizada') DEFAULT 'planificada'
);

-- Tabla de áreas habilitadas por convocatoria
CREATE TABLE convocatoria_areas (
    id_convocatoria_area INT PRIMARY KEY AUTO_INCREMENT,
    id_convocatoria INT NOT NULL,
    id_area INT NOT NULL,
    costo_inscripcion DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_convocatoria) REFERENCES convocatorias(id_convocatoria),
    FOREIGN KEY (id_area) REFERENCES areas_competencia(id_area),
    UNIQUE KEY (id_convocatoria, id_area)
);

-- Tabla de niveles habilitados por convocatoria
CREATE TABLE convocatoria_niveles (
    id_convocatoria_nivel INT PRIMARY KEY AUTO_INCREMENT,
    id_convocatoria INT NOT NULL,
    id_nivel INT NOT NULL,
    FOREIGN KEY (id_convocatoria) REFERENCES convocatorias(id_convocatoria),
    FOREIGN KEY (id_nivel) REFERENCES niveles_categoria(id_nivel),
    UNIQUE KEY (id_convocatoria, id_nivel)
);

-- Tabla de listas de inscripción (para grupos grandes)
CREATE TABLE listas_inscripcion (
    id_lista INT PRIMARY KEY AUTO_INCREMENT,
    codigo_lista VARCHAR(20) UNIQUE NOT NULL,
    id_unidad_educativa INT NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    FOREIGN KEY (id_unidad_educativa) REFERENCES unidades_educativas(id_unidad_educativa)
);

-- Tabla de detalles de listas de inscripción
CREATE TABLE detalles_lista_inscripcion (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_lista INT NOT NULL,
    id_estudiante INT NOT NULL,
    id_convocatoria_area INT NOT NULL,
    id_convocatoria_nivel INT NOT NULL,
    id_tutor_academico INT NULL, -- Tutor específico para esta área
    fecha_registro DATETIME NOT NULL,
    FOREIGN KEY (id_lista) REFERENCES listas_inscripcion(id_lista) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_convocatoria_area) REFERENCES convocatoria_areas(id_convocatoria_area),
    FOREIGN KEY (id_convocatoria_nivel) REFERENCES convocatoria_niveles(id_convocatoria_nivel),
    FOREIGN KEY (id_tutor_academico) REFERENCES tutores_academicos(id_tutor_academico),
    UNIQUE KEY (id_lista, id_estudiante, id_convocatoria_area)
);

-- Tabla de inscripciones individuales
CREATE TABLE inscripciones (
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    id_estudiante INT NOT NULL,
    id_convocatoria_area INT NOT NULL,
    id_convocatoria_nivel INT NOT NULL,
    id_tutor_academico INT NULL, -- Tutor específico para esta área
    fecha_inscripcion DATETIME NOT NULL,
    estado ENUM('pendiente', 'pagada', 'verificada') DEFAULT 'pendiente',
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_convocatoria_area) REFERENCES convocatoria_areas(id_convocatoria_area),
    FOREIGN KEY (id_convocatoria_nivel) REFERENCES convocatoria_niveles(id_convocatoria_nivel),
    FOREIGN KEY (id_tutor_academico) REFERENCES tutores_academicos(id_tutor_academico),
    UNIQUE KEY (id_estudiante, id_convocatoria_area)
);

-- Tabla de órdenes de pago
CREATE TABLE ordenes_pago (
    id_orden INT PRIMARY KEY AUTO_INCREMENT,
    codigo_unico VARCHAR(20) UNIQUE NOT NULL,
    tipo_origen ENUM('individual', 'lista') NOT NULL,
    id_inscripcion INT NULL, -- Para pagos individuales
    id_lista INT NULL,       -- Para pagos grupales
    monto_total DECIMAL(10,2) NOT NULL,
    fecha_emision DATETIME NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado ENUM('pendiente', 'pagada', 'vencida') DEFAULT 'pendiente',
    FOREIGN KEY (id_inscripcion) REFERENCES inscripciones(id_inscripcion),
    FOREIGN KEY (id_lista) REFERENCES listas_inscripcion(id_lista),
    CHECK (
        (tipo_origen = 'individual' AND id_inscripcion IS NOT NULL) OR
        (tipo_origen = 'lista' AND id_lista IS NOT NULL)
    )
);

-- Tabla de comprobantes de pago
CREATE TABLE comprobantes_pago (
    id_comprobante INT PRIMARY KEY AUTO_INCREMENT,
    id_orden INT NOT NULL,
    numero_comprobante VARCHAR(50) NOT NULL,
    nombre_pagador VARCHAR(100) NOT NULL,
    fecha_pago DATETIME NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    pdf_comprobante LONGBLOB NOT NULL,
    datos_ocr JSON,
    estado_verificacion ENUM('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (id_orden) REFERENCES ordenes_pago(id_orden)
);

-- Valida máximo de áreas por estudiante
DELIMITER //
CREATE TRIGGER valida_max_areas_inscripcion
BEFORE INSERT ON inscripciones
FOR EACH ROW
BEGIN
    DECLARE conteo_areas INT;
    DECLARE max_permitido INT;
    
    SELECT c.max_areas_por_estudiante INTO max_permitido
    FROM convocatoria_areas ca
    JOIN convocatorias c ON ca.id_convocatoria = c.id_convocatoria
    WHERE ca.id_convocatoria_area = NEW.id_convocatoria_area;
    
    SELECT COUNT(*) INTO conteo_areas
    FROM inscripciones i
    JOIN convocatoria_areas ca ON i.id_convocatoria_area = ca.id_convocatoria_area
    WHERE i.id_estudiante = NEW.id_estudiante
    AND ca.id_convocatoria = (
        SELECT id_convocatoria 
        FROM convocatoria_areas 
        WHERE id_convocatoria_area = NEW.id_convocatoria_area
    );
    
    IF conteo_areas >= max_permitido THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Límite de áreas alcanzado (Máximo: ', max_permitido, ')');
    END IF;
END//
DELIMITER ;

-- Actualiza estado de inscripción al verificar comprobante
DELIMITER //
CREATE TRIGGER actualiza_estado_inscripcion
AFTER UPDATE ON comprobantes_pago
FOR EACH ROW
BEGIN
    IF NEW.estado_verificacion = 'verificado' THEN
        -- Para órdenes individuales
        UPDATE inscripciones i
        JOIN ordenes_pago o ON i.id_inscripcion = o.id_inscripcion
        SET i.estado = 'verificada'
        WHERE o.id_orden = NEW.id_orden;
        
        -- Para órdenes grupales
        UPDATE detalles_lista_inscripcion d
        JOIN ordenes_pago o ON d.id_lista = o.id_lista
        JOIN inscripciones i ON d.id_estudiante = i.id_estudiante AND d.id_convocatoria_area = i.id_convocatoria_area
        SET i.estado = 'verificada'
        WHERE o.id_orden = NEW.id_orden;
    END IF;
END//
DELIMITER ;

-- --------------------------------------------------------
-- Índices para optimización
-- --------------------------------------------------------

CREATE INDEX idx_estudiante_convocatoria ON inscripciones(id_estudiante, id_convocatoria_area);
CREATE INDEX idx_lista_estudiante ON detalles_lista_inscripcion(id_lista, id_estudiante);
CREATE INDEX idx_orden_estado ON ordenes_pago(estado, fecha_emision);
CREATE INDEX idx_comprobante_verificacion ON comprobantes_pago(estado_verificacion, fecha_pago);