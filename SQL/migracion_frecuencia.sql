USE lifesync;

ALTER TABLE habitos_usuario
MODIFY COLUMN frecuencia ENUM(
    'diaria',
    'semanal',
    'personalizada',
    'mensual'
) NOT NULL DEFAULT 'diaria';

UPDATE habitos_usuario
SET frecuencia = 'personalizada'
WHERE frecuencia = 'dias específicos';
