// Base de ejemplo del curso de SQL: una biblioteca escolar. Cada caso de prueba
// recibe una base NUEVA creada con este script. Hay dos conjuntos de datos con
// el mismo esquema: el caso visible usa el A (el que el alumno puede explorar) y
// los casos ocultos usan el B, para que una consulta que "adivina" los valores
// del ejemplo (en vez de resolver el problema) no pase.

export const SCHEMA = `
CREATE TABLE alumnos (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  curso TEXT NOT NULL,
  ciudad TEXT NOT NULL
);
CREATE TABLE libros (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  genero TEXT NOT NULL,
  anio INTEGER NOT NULL,
  copias INTEGER NOT NULL
);
CREATE TABLE prestamos (
  id INTEGER PRIMARY KEY,
  alumno_id INTEGER NOT NULL REFERENCES alumnos(id),
  libro_id INTEGER NOT NULL REFERENCES libros(id),
  fecha TEXT NOT NULL,
  devuelto INTEGER NOT NULL
);
`;

const DATA_A = `
INSERT INTO alumnos VALUES
  (1, 'Ana López', '3A', 'Rosario'),
  (2, 'Bruno Díaz', '3A', 'Córdoba'),
  (3, 'Carla Ruiz', '3B', 'Rosario'),
  (4, 'Diego Sosa', '3B', 'Mendoza'),
  (5, 'Elena Paz', '4A', 'Córdoba'),
  (6, 'Facundo Gil', '4A', 'Rosario'),
  (7, 'Gala Torres', '4B', 'Salta'),
  (8, 'Hugo Vera', '4B', 'Mendoza'),
  (9, 'Inés Mora', '5A', 'Rosario'),
  (10, 'Julián Ríos', '5A', 'Córdoba');
INSERT INTO libros VALUES
  (1, 'El túnel', 'Ernesto Sabato', 'Novela', 1948, 3),
  (2, 'Rayuela', 'Julio Cortázar', 'Novela', 1963, 2),
  (3, 'Ficciones', 'Jorge Luis Borges', 'Cuento', 1944, 4),
  (4, 'El Aleph', 'Jorge Luis Borges', 'Cuento', 1949, 3),
  (5, 'Cosmos', 'Carl Sagan', 'Ciencia', 1980, 5),
  (6, 'Breve historia del tiempo', 'Stephen Hawking', 'Ciencia', 1988, 2),
  (7, 'Sapiens', 'Yuval Noah Harari', 'Historia', 2011, 6),
  (8, 'El principito', 'Antoine de Saint-Exupéry', 'Novela', 1943, 7),
  (9, 'Las venas abiertas de América Latina', 'Eduardo Galeano', 'Historia', 1971, 2),
  (10, 'Veinte poemas de amor y una canción desesperada', 'Pablo Neruda', 'Poesía', 1924, 3),
  (11, 'Matemática... ¿estás ahí?', 'Adrián Paenza', 'Ciencia', 2005, 4),
  (12, 'Homo Deus', 'Yuval Noah Harari', 'Historia', 2015, 5),
  (13, 'El gen egoísta', 'Richard Dawkins', 'Ciencia', 1976, 2),
  (14, 'La ciudad y los perros', 'Mario Vargas Llosa', 'Novela', 1963, 3),
  (15, 'Cuentos de la selva', 'Horacio Quiroga', 'Cuento', 1918, 6),
  (16, 'Factfulness', 'Hans Rosling', 'Ciencia', 2018, 3),
  (17, 'El infinito en un junco', 'Irene Vallejo', 'Historia', 2019, 4);
INSERT INTO prestamos VALUES
  (1, 1, 8, '2024-03-04', 1),
  (2, 1, 5, '2024-03-18', 1),
  (3, 1, 7, '2024-04-02', 0),
  (4, 2, 3, '2024-03-05', 1),
  (5, 2, 4, '2024-03-20', 1),
  (6, 3, 8, '2024-03-06', 1),
  (7, 3, 12, '2024-04-08', 0),
  (8, 3, 1, '2024-04-15', 0),
  (9, 4, 6, '2024-03-07', 1),
  (10, 5, 2, '2024-03-12', 1),
  (11, 5, 14, '2024-03-25', 1),
  (12, 6, 5, '2024-03-13', 1),
  (13, 7, 10, '2024-03-14', 1),
  (14, 7, 15, '2024-04-01', 0),
  (15, 8, 9, '2024-03-22', 1),
  (16, 2, 16, '2024-04-10', 0),
  (17, 1, 17, '2024-04-12', 0),
  (18, 5, 13, '2024-04-16', 1);
`;

const DATA_B = `
INSERT INTO alumnos VALUES
  (1, 'Lola Pérez', '3A', 'Mendoza'),
  (2, 'Mateo Quiroga', '4A', 'Rosario'),
  (3, 'Nora Ibarra', '5A', 'Rosario'),
  (4, 'Omar Silva', '5A', 'Salta'),
  (5, 'Paula Costa', '3B', 'Rosario'),
  (6, 'Rafael Núñez', '4B', 'Mendoza');
INSERT INTO libros VALUES
  (1, 'El mundo y sus demonios', 'Carl Sagan', 'Ciencia', 1995, 4),
  (2, 'Elogio de la sombra', 'Jorge Luis Borges', 'Poesía', 1969, 2),
  (3, 'Bestiario', 'Julio Cortázar', 'Cuento', 1951, 5),
  (4, 'Armas, gérmenes y acero', 'Jared Diamond', 'Historia', 1997, 3),
  (5, 'Sapiens', 'Yuval Noah Harari', 'Historia', 2011, 8),
  (6, 'Homo Deus', 'Yuval Noah Harari', 'Historia', 2015, 6),
  (7, '21 lecciones para el siglo XXI', 'Yuval Noah Harari', 'Historia', 2018, 1),
  (8, 'Pedro Páramo', 'Juan Rulfo', 'Novela', 1955, 7);
INSERT INTO prestamos VALUES
  (1, 1, 3, '2024-05-02', 1),
  (2, 1, 5, '2024-05-09', 0),
  (3, 2, 8, '2024-05-03', 1),
  (4, 2, 1, '2024-05-10', 1),
  (5, 2, 6, '2024-05-17', 0),
  (6, 3, 5, '2024-05-04', 1),
  (7, 4, 4, '2024-05-06', 1);
`;

export const SETUP_A = SCHEMA + DATA_A;
export const SETUP_B = SCHEMA + DATA_B;

// Recordatorio del esquema que va como comentario en el codigo inicial de cada
// ejercicio (el alumno no ve las tablas de otra forma).
export const SCHEMA_HINT = `-- Tablas:
--   alumnos(id, nombre, curso, ciudad)
--   libros(id, titulo, autor, genero, anio, copias)
--   prestamos(id, alumno_id, libro_id, fecha, devuelto)
`;
