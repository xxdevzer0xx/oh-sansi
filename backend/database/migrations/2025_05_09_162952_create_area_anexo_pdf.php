<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pdf_files', function (Blueprint $table) {
            $table->id('id_anexo_pdf');
            $table->foreignId('id_convocatoria_area')->constrained('convocatoria_areas','id_convocatoria_area');
            $table->string('original_name');
            $table->string('mime_type');
            $table->binary('content'); // stores the actual PDF binary data
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_files');
    }
};
