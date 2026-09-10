CREATE DATABASE IF NOT EXISTS lifesync;

USE lifesync;

CREATE TABLE IF NOT EXISTS usuario (

    id_usuario INT AUTO_INCREMENT PRIMARY KEY,

    nombre_usuario VARCHAR(50) NOT NULL,

    nombre_completo VARCHAR(150) NULL,

    correo VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    fecha_nacimiento DATE NULL,

    genero ENUM(
        'femenino',
        'masculino',
        'otro'
    ) NULL,

    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    estado ENUM(
        'activo',
        'suspendido'
    ) DEFAULT 'activo'

);


CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO categorias (nombre)
VALUES
('Hidratación'),
('Salud Mental'),
('Académico'),
('Actividad Física'),
('Alimentación');


CREATE TABLE IF NOT EXISTS preferencias_usuario (

    id_preferencia INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL UNIQUE,

    tema ENUM(
        'claro',
        'oscuro',
        'sistema'
    ) DEFAULT 'oscuro',

    idioma VARCHAR(10) DEFAULT 'es',

    notificaciones_activas BOOLEAN DEFAULT TRUE,

    sonidos_activados BOOLEAN DEFAULT TRUE,

    sincronizacion_automatica BOOLEAN DEFAULT TRUE,

    fecha_actualizacion DATETIME
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS perfil_usuario (

    id_perfil INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL UNIQUE,

    foto_perfil VARCHAR(255) NULL,

    biografia VARCHAR(255) NULL,

    fecha_actualizacion DATETIME
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE

);




CREATE TABLE IF NOT EXISTS habitos (

    id_habito INT AUTO_INCREMENT PRIMARY KEY,

    id_categoria INT NULL,

    nombre_habito VARCHAR(150) NOT NULL,

    descripcion TEXT NULL,

    es_base BOOLEAN NOT NULL DEFAULT FALSE,

    color VARCHAR(20) NULL,

    imagen_url VARCHAR(255) NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE SET NULL

);


CREATE TABLE habitos_usuario (
    id_habito_usuario INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,
    id_habito INT NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    objetivo DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(30) NOT NULL,

    frecuencia ENUM('diaria', 'semanal', 'dias específicos')
        NOT NULL DEFAULT 'diaria',

    duracion_minutos INT NULL,

    fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_fin DATE NULL,

    CONSTRAINT fk_habitos_usuario_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_habitos_usuario_habito
        FOREIGN KEY (id_habito)
        REFERENCES habitos(id_habito)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_usuario_habito
        UNIQUE (id_usuario, id_habito),

    CONSTRAINT chk_objetivo_positivo
        CHECK (objetivo > 0),

    CONSTRAINT chk_duracion_positiva
        CHECK (
            duracion_minutos IS NULL
            OR duracion_minutos > 0
        ),

    CONSTRAINT chk_fechas
        CHECK (
            fecha_fin IS NULL
            OR fecha_fin >= fecha_inicio
        )
);

CREATE TABLE habito_dias (
    id_habito_dia INT AUTO_INCREMENT PRIMARY KEY,

    id_habito_usuario INT NOT NULL,

    dia_semana TINYINT NOT NULL,

    CONSTRAINT fk_habito_dias_habito_usuario
        FOREIGN KEY (id_habito_usuario)
        REFERENCES habitos_usuario(id_habito_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_habito_dia
        UNIQUE (id_habito_usuario, dia_semana),

    CONSTRAINT chk_dia_semana
        CHECK (dia_semana BETWEEN 1 AND 7)
);




CREATE TABLE IF NOT EXISTS recordatorios (

    id_recordatorio INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_categoria INT NULL,

    titulo VARCHAR(150) NOT NULL,

    hora TIME NOT NULL,

    repeticion ENUM(
        'diario',
        'lunes_viernes',
        'una_vez',
        'personalizado'
    ) NOT NULL DEFAULT 'diario',

    fecha_recordatorio DATE NULL,

    mensaje VARCHAR(255) NULL,

    activo BOOLEAN DEFAULT TRUE,

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



CREATE TABLE IF NOT EXISTS rachas (

    id_racha INT AUTO_INCREMENT PRIMARY KEY,

    id_habito_usuario INT NOT NULL UNIQUE,

    racha_actual INT DEFAULT 0,

    mejor_racha INT DEFAULT 0,

    total_completados INT DEFAULT 0,

    ultima_fecha DATE NULL,

    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_habito_usuario)
        REFERENCES habitos_usuario(id_habito_usuario)
        ON DELETE CASCADE

);



CREATE TABLE IF NOT EXISTS logros (

    id_logro INT AUTO_INCREMENT PRIMARY KEY,

    nombre_logro VARCHAR(150) NOT NULL UNIQUE,

    descripcion VARCHAR(255) NOT NULL,

    icono VARCHAR(100) NULL,

    requisito INT DEFAULT 0

);


CREATE TABLE IF NOT EXISTS usuario_logros (

    id_usuario INT NOT NULL,

    id_logro INT NOT NULL,

    fecha_obtenido DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (
        id_usuario,
        id_logro
    ),

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    FOREIGN KEY (id_logro)
        REFERENCES logros(id_logro)
        ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS configuracion_usuario (

    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL UNIQUE,

    modo_tema ENUM(
        'claro',
        'oscuro',
        'sistema'
    ) DEFAULT 'oscuro',

    idioma VARCHAR(10) DEFAULT 'es',

    notificaciones BOOLEAN DEFAULT TRUE,

    sonidos BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE

);


CREATE TABLE IF NOT EXISTS sesiones_usuario (

    id_sesion INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    token_sesion VARCHAR(255) NOT NULL UNIQUE,

    dispositivo VARCHAR(255) NULL,

    ip VARCHAR(45) NULL,

    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,

    ultimo_acceso DATETIME DEFAULT CURRENT_TIMESTAMP,

    activa BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE

);
CREATE TABLE IF NOT EXISTS configuracion_usuario (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,

    idioma VARCHAR(10) NOT NULL DEFAULT 'es',

    notificaciones_activas BOOLEAN NOT NULL DEFAULT TRUE,
    sonido_notificaciones BOOLEAN NOT NULL DEFAULT TRUE,
    correo_notificaciones BOOLEAN NOT NULL DEFAULT FALSE,

    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_configuracion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);



INSERT INTO habitos
    (nombre_habito, descripcion, id_categoria, es_base)
VALUES
(
    'Hidratación',
    'Tomar 8 vasos de agua al día',
    1,
    TRUE
),
(
    'Salud Mental',
    'Realizar sesiones de relajación',
    2,
    TRUE
),
(
    'Académico',
    'Realizar sesiones de estudio',
    3,
    TRUE
),
(
    'Actividad Física',
    'Realizar sesiones de ejercicio',
    4,
    TRUE
),
(
    'Alimentación',
    'Realizar las comidas del día',
    5,
    TRUE
);