CREATE DATABASE IF NOT EXISTS lifesync;

USE lifesync;

CREATE TABLE IF NOT EXISTS usuario(
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,

    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,

    correo VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    fecha_nacimiento DATE,

    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    estado ENUM(
        'activo',
        'suspendido'
    ) DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS categorias(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,

    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,

    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS habitos(
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

    dias_semana VARCHAR(50),

    activo BOOLEAN DEFAULT TRUE,

    color VARCHAR(20),

    icono VARCHAR(50),

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_usuario)
        REFERENCES usuario(id_usuario),

    FOREIGN KEY(id_categoria)
        REFERENCES categorias(id_categoria)
);

CREATE TABLE IF NOT EXISTS notificaciones(
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    titulo VARCHAR(150) NOT NULL,

    mensaje TEXT NOT NULL,

    leida BOOLEAN DEFAULT FALSE,

    fecha_notificacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS configuracion_notificaciones(
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL UNIQUE,

    correo_recordatorios BOOLEAN DEFAULT TRUE,

    correo_logros BOOLEAN DEFAULT TRUE,

    FOREIGN KEY(id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS registros_habitos(
    id_registro INT AUTO_INCREMENT PRIMARY KEY,

    id_habito INT NOT NULL,

    valor_registrado DECIMAL(10,2) NOT NULL,

    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    observaciones VARCHAR(255),

    FOREIGN KEY(id_habito)
        REFERENCES habitos(id_habito)
);

CREATE TABLE IF NOT EXISTS rachas(
    id_racha INT AUTO_INCREMENT PRIMARY KEY,

    id_habito INT NOT NULL UNIQUE,

    racha_actual INT DEFAULT 0,

    mejor_racha INT DEFAULT 0,

    total_completados INT DEFAULT 0,

    ultima_fecha DATE,

    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(id_habito)
        REFERENCES habitos(id_habito)
);