USE lifesync;

INSERT IGNORE INTO categorias (nombre)
VALUES ('Hábito Personalizado');

ALTER TABLE registros_habitos
ADD COLUMN id_habito_usuario INT NULL AFTER id_registro;

ALTER TABLE registros_habitos
MODIFY COLUMN id_habito INT NULL;

ALTER TABLE estadisticas_habitos
ADD COLUMN id_habito_usuario INT NULL AFTER id_estadistica;

ALTER TABLE estadisticas_habitos
DROP INDEX unica_estadistica_habito_fecha;

ALTER TABLE estadisticas_habitos
ADD UNIQUE KEY unica_estadistica_habito_usuario_fecha (
    id_habito_usuario,
    fecha
);

ALTER TABLE registros_habitos
ADD CONSTRAINT fk_registros_habito_usuario
FOREIGN KEY (id_habito_usuario)
REFERENCES habitos_usuario(id_habito_usuario)
ON UPDATE CASCADE
ON DELETE CASCADE;

ALTER TABLE estadisticas_habitos
ADD CONSTRAINT fk_estadisticas_habito_usuario
FOREIGN KEY (id_habito_usuario)
REFERENCES habitos_usuario(id_habito_usuario)
ON UPDATE CASCADE
ON DELETE CASCADE;
