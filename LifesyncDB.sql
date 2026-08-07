CREATE DATABASE IF NOT EXISTS lifesync;

USE lifesync;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'suspendido') DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

INSERT IGNORE INTO categorias (
    nombre_categoria,
    descripcion
) VALUES
(
    'Hidratación',
    'Controla tu consumo diario de agua.'
),
(
    'Alimentación',
    'Registra tus comidas diarias.'
),
(
    'Salud Mental',
    'Haz seguimiento a tus descansos y bienestar.'
),
(
    'Actividad Física',
    'Registra tus sesiones de ejercicio.'
),
(
    'Registro Académico',
    'Organiza tus actividades y tareas.'
),
(
    'Hábito Personalizado',
    'Crea un hábito completamente personalizado.'
);

CREATE TABLE IF NOT EXISTS habitos (
    id_habito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_categoria INT NULL,
    nombre_habito VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    tipo_medicion ENUM(
        'cantidad',
        'tiempo',
        'completar'
    ) NOT NULL,
    objetivo DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(50) NULL,
    frecuencia ENUM(
        'diaria',
        'semanal'
    ) NOT NULL,
    dias_semana VARCHAR(50) NULL,
    activo BOOLEAN DEFAULT TRUE,
    color VARCHAR(20) NULL,
    icono VARCHAR(50) NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_notificacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS configuracion_notificaciones (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    correo_recordatorios BOOLEAN DEFAULT TRUE,
    correo_logros BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registros_habitos (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_habito INT NOT NULL,
    valor_registrado DECIMAL(10,2) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(255) NULL,

    FOREIGN KEY (id_habito)
        REFERENCES habitos(id_habito)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rachas (
    id_racha INT AUTO_INCREMENT PRIMARY KEY,
    id_habito INT NOT NULL UNIQUE,
    racha_actual INT DEFAULT 0,
    mejor_racha INT DEFAULT 0,
    total_completados INT DEFAULT 0,
    ultima_fecha DATE NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_habito)
        REFERENCES habitos(id_habito)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuario_categorias (
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,

    PRIMARY KEY (id_usuario, id_categoria),

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE CASCADE
);