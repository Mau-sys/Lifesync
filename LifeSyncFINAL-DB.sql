CREATE DATABASE IF NOT EXISTS lifesync;

USE lifesync;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(150) NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NULL,
    genero ENUM('femenino', 'masculino', 'otro') NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'suspendido') DEFAULT 'activo'
);


CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

INSERT IGNORE INTO categorias
    (nombre, descripcion)
VALUES
    ('Hidratación', 'Controla tu consumo diario de agua.'),
    ('Alimentación', 'Registra tus comidas diarias.'),
    ('Salud Mental', 'Haz seguimiento a tu bienestar.'),
    ('Actividad Física', 'Registra tus sesiones de ejercicio.'),
    ('Registro Académico', 'Organiza tus actividades y tareas.'),
    ('Hábito Personalizado', 'Crea un hábito completamente personalizado.');



CREATE TABLE IF NOT EXISTS preferencias_usuario (
    id_preferencia INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,

    tema ENUM('claro', 'oscuro', 'sistema')
        DEFAULT 'oscuro',

    idioma VARCHAR(10)
        DEFAULT 'es',

    notificaciones_activas BOOLEAN
        DEFAULT TRUE,

    sonidos_activados BOOLEAN
        DEFAULT TRUE,

    sincronizacion_automatica BOOLEAN
        DEFAULT TRUE,

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

    fecha_creacion DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE SET NULL
);



CREATE TABLE IF NOT EXISTS habitos_usuario (
    id_habito_usuario INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_habito INT NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    objetivo DECIMAL(10,2) NOT NULL DEFAULT 1,

    unidad VARCHAR(30) NOT NULL DEFAULT 'completar',

    frecuencia ENUM(
        'diaria',
        'semanal',
        'dias específicos',
        'mensual'
    ) NOT NULL DEFAULT 'diaria',

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


CREATE TABLE IF NOT EXISTS habito_dias (
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


CREATE TABLE IF NOT EXISTS registros_habitos (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,

    id_habito_usuario INT NOT NULL,

    valor_registrado DECIMAL(10,2) NOT NULL,

    fecha_registro DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    observaciones VARCHAR(255) NULL,

    CONSTRAINT fk_registros_habito_usuario
        FOREIGN KEY (id_habito_usuario)
        REFERENCES habitos_usuario(id_habito_usuario)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS estadisticas_habitos (
    id_estadistica INT AUTO_INCREMENT PRIMARY KEY,

    id_habito_usuario INT NOT NULL,

    fecha DATE NOT NULL,

    objetivo DECIMAL(10,2)
        DEFAULT 0,

    progreso DECIMAL(10,2)
        DEFAULT 0,

    porcentaje DECIMAL(5,2)
        DEFAULT 0,

    completado BOOLEAN
        DEFAULT FALSE,

    CONSTRAINT fk_estadisticas_habito_usuario
        FOREIGN KEY (id_habito_usuario)
        REFERENCES habitos_usuario(id_habito_usuario)
        ON DELETE CASCADE,

    UNIQUE KEY unica_estadistica_habito_fecha (
        id_habito_usuario,
        fecha
    )
);


CREATE TABLE IF NOT EXISTS rachas (
    id_racha INT AUTO_INCREMENT PRIMARY KEY,

    id_habito_usuario INT NOT NULL UNIQUE,

    racha_actual INT DEFAULT 0,

    mejor_racha INT DEFAULT 0,

    total_completados INT DEFAULT 0,

    ultima_fecha DATE NULL,

    fecha_inicio DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_habito_usuario)
        REFERENCES habitos_usuario(id_habito_usuario)
        ON DELETE CASCADE
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

    fecha_creacion DATETIME
        DEFAULT CURRENT_TIMESTAMP,

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

    fecha_notificacion DATETIME
        DEFAULT CURRENT_TIMESTAMP,

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

    fecha_obtenido DATETIME
        DEFAULT CURRENT_TIMESTAMP,

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

    idioma VARCHAR(10)
        NOT NULL DEFAULT 'es',

    notificaciones_activas BOOLEAN
        NOT NULL DEFAULT TRUE,

    sonido_notificaciones BOOLEAN
        NOT NULL DEFAULT TRUE,

    correo_notificaciones BOOLEAN
        NOT NULL DEFAULT FALSE,

    fecha_actualizacion TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_configuracion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS sesiones_usuario (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    token_sesion VARCHAR(255) NOT NULL UNIQUE,

    dispositivo VARCHAR(255) NULL,

    ip VARCHAR(45) NULL,

    fecha_inicio DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    ultimo_acceso DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    activa BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);


INSERT INTO habitos
    (nombre_habito, descripcion, id_categoria, es_base, color, imagen_url)
SELECT
    'Hidratación',
    'Tomar 8 vasos de agua al día',
    id_categoria,
    TRUE,
    '#4FC3F7',
    'img/Hidrat.png'
FROM categorias
WHERE nombre = 'Hidratación'
AND NOT EXISTS (
    SELECT 1
    FROM habitos
    WHERE nombre_habito = 'Hidratación'
);


INSERT INTO habitos
    (nombre_habito, descripcion, id_categoria, es_base, color, imagen_url)
SELECT
    'Alimentación',
    'Registrar las comidas del día',
    id_categoria,
    TRUE,
    '#81C784',
    'img/Alimen.png'
FROM categorias
WHERE nombre = 'Alimentación'
AND NOT EXISTS (
    SELECT 1
    FROM habitos
    WHERE nombre_habito = 'Alimentación'
);


INSERT INTO habitos
    (nombre_habito, descripcion, id_categoria, es_base, color, imagen_url)
SELECT
    'Salud Mental',
    'Registrar actividades de bienestar y descanso',
    id_categoria,
    TRUE,
    '#BA68C8',
    'img/S-Mental.png'
FROM categorias
WHERE nombre = 'Salud Mental'
AND NOT EXISTS (
    SELECT 1
    FROM habitos
    WHERE nombre_habito = 'Salud Mental'
);


INSERT INTO habitos
    (nombre_habito, descripcion, id_categoria, es_base, color, imagen_url)
SELECT
    'Actividad Física',
    'Registrar sesiones de actividad física',
    id_categoria,
    TRUE,
    '#FFD54F',
    'img/A-Fisica.png'
FROM categorias
WHERE nombre = 'Actividad Física'
AND NOT EXISTS (
    SELECT 1
    FROM habitos
    WHERE nombre_habito = 'Actividad Física'
);


INSERT INTO habitos
    (nombre_habito, descripcion, id_categoria, es_base, color, imagen_url)
SELECT
    'Registro Académico',
    'Organizar actividades y sesiones de estudio',
    id_categoria,
    TRUE,
    '#F06292',
    'img/R-Academ.png'
FROM categorias
WHERE nombre = 'Registro Académico'
AND NOT EXISTS (
    SELECT 1
    FROM habitos
    WHERE nombre_habito = 'Registro Académico'
);



INSERT IGNORE INTO logros
    (nombre_logro, descripcion, icono, requisito)
VALUES
    ('Primer hábito', 'Completaste tu primer registro de hábito.', '🌱', 1),
    ('Constancia', 'Completaste 7 registros de hábitos.', '🔥', 7),
    ('Disciplina', 'Completaste 30 registros de hábitos.', '🏆', 30),
    ('Gran comienzo', 'Completaste 100 registros de hábitos.', '⭐', 100);