-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-11-2025 a las 22:02:07
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `medidino_medicos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_servicios`
--

CREATE TABLE `areas_servicios` (
  `id_area` int(11) NOT NULL,
  `nombre_area` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `responsable_id` int(11) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `areas_servicios`
--

INSERT INTO `areas_servicios` (`id_area`, `nombre_area`, `descripcion`, `ubicacion`, `capacidad`, `responsable_id`, `activa`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Consulta Externa', 'Área de consultas ambulatorias', 'Piso 1', 50, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(2, 'Urgencias', 'Área de atención de urgencias y emergencias', 'Piso 1', 30, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(3, 'Hospitalización', 'Área de internación de pacientes', 'Pisos 2-4', 200, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(4, 'Quirófano', 'Área de procedimientos quirúrgicos', 'Piso 3', 4, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(5, 'Cuidados Intensivos', 'Unidad de cuidados intensivos', 'Piso 4', 20, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(6, 'Laboratorio', 'Laboratorio de análisis clínicos', 'Sótano', 100, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(7, 'Imagenología', 'Área de radiología y ecografías', 'Piso 2', 8, NULL, 1, '2025-11-10 20:19:42', '2025-11-10 20:19:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones_medicos`
--

CREATE TABLE `asignaciones_medicos` (
  `id_asignacion_med` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_sala` int(11) DEFAULT NULL,
  `tipo_asignacion` enum('Paciente','Sala','Procedimiento') NOT NULL,
  `fecha_asignacion` datetime NOT NULL,
  `fecha_fin_asignacion` datetime DEFAULT NULL,
  `razon_reasignacion` varchar(200) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_medicos`
--

CREATE TABLE `auditoria_medicos` (
  `id_auditoria` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `tipo_cambio` enum('Creación','Actualización','Eliminación','Desactivación') NOT NULL,
  `campos_modificados` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`campos_modificados`)),
  `usuario_responsable` varchar(100) DEFAULT NULL,
  `direccion_ip` varchar(45) DEFAULT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_profesionales`
--

CREATE TABLE `documentos_profesionales` (
  `id_documento` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `tipo_documento` enum('Diploma','Certificado','Licencia','Especializacion','Otro') NOT NULL,
  `nombre_documento` varchar(200) NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `institucion_emisora` varchar(150) DEFAULT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `nombre_archivo` varchar(200) NOT NULL,
  `tamaño_archivo` int(11) DEFAULT NULL,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `verificado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id_especialidad` int(11) NOT NULL,
  `nombre_especialidad` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `especialidades`
--

INSERT INTO `especialidades` (`id_especialidad`, `nombre_especialidad`, `descripcion`, `departamento`, `activa`, `fecha_creacion`) VALUES
(1, 'Cardiología', 'Especialidad médica del corazón y sistema cardiovascular', 'Medicina Interna', 1, '2025-11-10 20:19:41'),
(2, 'Pediatría', 'Especialidad médica de enfermedades en niños', 'Pediatría', 1, '2025-11-10 20:19:41'),
(3, 'Neurología', 'Especialidad médica del sistema nervioso', 'Medicina Interna', 1, '2025-11-10 20:19:41'),
(4, 'Dermatología', 'Especialidad médica de enfermedades de la piel', 'Cirugía', 1, '2025-11-10 20:19:41'),
(5, 'Oftalmología', 'Especialidad médica de enfermedades del ojo', 'Cirugía', 1, '2025-11-10 20:19:41'),
(6, 'Ginecología', 'Especialidad médica de la salud reproductiva femenina', 'Ginecología', 1, '2025-11-10 20:19:41'),
(7, 'Cirugía General', 'Especialidad quirúrgica general', 'Cirugía', 1, '2025-11-10 20:19:41'),
(8, 'Ortopedia', 'Especialidad médica del sistema musculoesquelético', 'Cirugía', 1, '2025-11-10 20:19:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_laborales`
--

CREATE TABLE `horarios_laborales` (
  `id_horario` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo_turno` enum('Mañana','Tarde','Noche','Completo') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios_laborales`
--

INSERT INTO `horarios_laborales` (`id_horario`, `id_medico`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo_turno`, `activo`, `fecha_creacion`) VALUES
(1, 1, 'Lunes', '08:00:00', '16:00:00', 'Mañana', 1, '2025-11-10 20:19:42'),
(2, 1, 'Martes', '08:00:00', '16:00:00', 'Mañana', 1, '2025-11-10 20:19:42'),
(3, 1, 'Miércoles', '08:00:00', '16:00:00', 'Mañana', 1, '2025-11-10 20:19:42'),
(4, 1, 'Jueves', '08:00:00', '16:00:00', 'Mañana', 1, '2025-11-10 20:19:42'),
(5, 1, 'Viernes', '08:00:00', '16:00:00', 'Mañana', 1, '2025-11-10 20:19:42'),
(6, 2, 'Lunes', '14:00:00', '22:00:00', 'Tarde', 1, '2025-11-10 20:19:42'),
(7, 2, 'Martes', '14:00:00', '22:00:00', 'Tarde', 1, '2025-11-10 20:19:42'),
(8, 2, 'Miércoles', '14:00:00', '22:00:00', 'Tarde', 1, '2025-11-10 20:19:42'),
(9, 2, 'Jueves', '14:00:00', '22:00:00', 'Tarde', 1, '2025-11-10 20:19:42'),
(10, 2, 'Viernes', '14:00:00', '22:00:00', 'Tarde', 1, '2025-11-10 20:19:42'),
(11, 6, 'Jueves', '07:00:00', '08:00:00', 'Mañana', 1, '2025-11-14 00:25:06'),
(12, 4, 'Jueves', '05:00:00', '06:00:00', 'Mañana', 1, '2025-11-14 01:17:11'),
(14, 6, 'Viernes', '09:00:00', '17:00:00', 'Mañana', 1, '2025-11-14 16:07:35'),
(15, 3, 'Viernes', '11:00:00', '23:00:00', 'Mañana', 1, '2025-11-14 16:15:23'),
(16, 6, 'Sábado', '11:00:00', '17:00:00', 'Mañana', 1, '2025-11-14 16:21:30'),
(17, 4, 'Domingo', '11:00:00', '16:00:00', 'Mañana', 1, '2025-11-14 16:22:50'),
(19, 1, 'Sábado', '11:30:00', '14:30:00', 'Mañana', 1, '2025-11-14 16:26:58'),
(21, 3, 'Sábado', '11:00:00', '13:00:00', 'Mañana', 1, '2025-11-14 16:52:28'),
(22, 8, 'Lunes', '03:00:00', '14:00:00', 'Completo', 1, '2025-11-15 20:55:03'),
(23, 8, 'Martes', '03:00:00', '14:00:00', 'Completo', 1, '2025-11-15 20:55:03'),
(24, 8, 'Miércoles', '03:00:00', '14:00:00', 'Completo', 1, '2025-11-15 20:55:03'),
(25, 7, 'Domingo', '19:00:00', '21:00:00', 'Completo', 1, '2025-11-17 00:36:41'),
(26, 6, 'Lunes', '11:00:00', '13:30:00', 'Completo', 1, '2025-11-17 16:36:58'),
(27, 9, 'Lunes', '14:30:00', '20:30:00', 'Completo', 1, '2025-11-19 19:44:11'),
(28, 9, 'Viernes', '11:00:00', '23:00:00', 'Completo', 1, '2025-11-19 19:44:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos`
--

CREATE TABLE `medicos` (
  `id_medico` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('M','F','Otro') NOT NULL,
  `direccion` text NOT NULL,
  `ciudad` varchar(50) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `numero_licencia` varchar(50) NOT NULL,
  `expedicion_licencia` date NOT NULL,
  `vencimiento_licencia` date NOT NULL,
  `id_especialidad` int(11) NOT NULL,
  `experiencia_anos` int(11) DEFAULT NULL,
  `estado_registro` enum('Activo','Inactivo','Suspendido') DEFAULT 'Activo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medicos`
--

INSERT INTO `medicos` (`id_medico`, `nombre`, `apellido`, `email`, `telefono`, `cedula`, `fecha_nacimiento`, `genero`, `direccion`, `ciudad`, `estado`, `numero_licencia`, `expedicion_licencia`, `vencimiento_licencia`, `id_especialidad`, `experiencia_anos`, `estado_registro`, `fecha_registro`, `fecha_actualizacion`) VALUES
(1, 'Juan', 'Pérez García', 'juan.perez@medidino.com', '+57 3001234567', '1234567890', '1975-05-15', 'M', 'Calle 10 #20-30', 'Bogotá', 'Distrito Capital', 'LIC-001', '2015-03-20', '2026-03-20', 1, 20, 'Activo', '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(2, 'María', 'González López', 'maria.gonzalez@medidino.com', '+57 3019876543', '9876543210', '1982-08-22', 'F', 'Carrera 15 #5-10', 'Medellín', 'Antioquia', 'LIC-002', '2018-06-15', '2028-06-15', 2, 15, 'Activo', '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(3, 'Carlos', 'Rodríguez Martínez', 'carlos.rodriguez@medidino.com', '+57 3105555555', '5555555555', '1978-11-30', 'M', 'Avenida 7 #50-70', 'Cali', 'Valle del Cauca', 'LIC-003', '2016-09-10', '2027-09-10', 3, 18, 'Activo', '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(4, 'Ana', 'Martínez Herrera', 'ana.martinez@medidino.com', '+57 3212223333', '2223333333', '1985-02-14', 'F', 'Calle 25 #40-50', 'Barranquilla', 'Atlántico', 'LIC-004', '2019-01-25', '2029-01-25', 4, 12, 'Activo', '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(5, 'Luis', 'Sánchez Díaz', 'luis.sanchez@medidino.com', '+57 3156666666', '6666666666', '1980-07-09', 'M', 'Carrera 20 #30-40', 'Bogotá', 'Distrito Capital', 'LIC-005', '2017-04-12', '2027-04-12', 1, 16, 'Activo', '2025-11-10 20:19:42', '2025-11-10 20:19:42'),
(6, 'Liliam', 'Duque', 'duqueliliam349@gmail.com', '3013717494', '1089930905', '2004-05-14', 'F', 'casa 2', 'Dosquebradas', 'Risaralda', '111', '2025-11-04', '0000-00-00', 1, 1, 'Activo', '2025-11-11 17:48:22', '2025-11-11 17:48:22'),
(7, 'Ana', 'Ruiz', 'Anaruiz@gmail.com', '1111', '11111', '2004-06-15', 'F', 'Calle falsa', 'Pereira', 'Risaralda', '11111', '2025-11-14', '0000-00-00', 6, 1, 'Activo', '2025-11-15 20:31:03', '2025-11-15 20:31:03'),
(8, 'Beatriz', 'Quintero', 'bety@hotmail.com', '+57 3146157471', '25109228', '1993-03-18', 'F', 'Cra 21', 'Dosquebradas', 'Risaralda', '0101', '2025-11-13', '0000-00-00', 3, 0, 'Activo', '2025-11-15 20:55:03', '2025-11-15 20:55:03'),
(9, 'Juan', 'Benavides', 'falso@gmail.com', '+57 3212223333', '223333', '2000-06-08', 'M', 'Calle falsa', 'Dosquebradas', 'Risaralda', '2222', '2024-02-06', '0000-00-00', 3, 3, 'Activo', '2025-11-19 19:44:11', '2025-11-19 19:44:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos_areas`
--

CREATE TABLE `medicos_areas` (
  `id_asignacion` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `id_area` int(11) NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_fin_asignacion` date DEFAULT NULL,
  `es_principal` tinyint(1) DEFAULT 0,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medicos_areas`
--

INSERT INTO `medicos_areas` (`id_asignacion`, `id_medico`, `id_area`, `fecha_asignacion`, `fecha_fin_asignacion`, `es_principal`, `activa`, `fecha_creacion`) VALUES
(1, 1, 1, '2023-01-15', NULL, 1, 1, '2025-11-10 20:19:42'),
(2, 2, 1, '2023-02-20', NULL, 1, 1, '2025-11-10 20:19:42'),
(3, 3, 1, '2023-03-10', NULL, 1, 1, '2025-11-10 20:19:42'),
(4, 4, 2, '2023-04-05', NULL, 1, 1, '2025-11-10 20:19:42'),
(5, 5, 3, '2023-05-12', NULL, 1, 1, '2025-11-10 20:19:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes_productividad`
--

CREATE TABLE `reportes_productividad` (
  `id_reporte` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `periodo_inicio` date NOT NULL,
  `periodo_fin` date NOT NULL,
  `total_consultas` int(11) DEFAULT 0,
  `total_procedimientos` int(11) DEFAULT 0,
  `total_pacientes_atendidos` int(11) DEFAULT 0,
  `horas_trabajadas` decimal(10,2) DEFAULT 0.00,
  `tasa_ocupacion` decimal(5,2) DEFAULT 0.00,
  `promedio_atencion_por_hora` decimal(10,2) DEFAULT 0.00,
  `observaciones` text DEFAULT NULL,
  `fecha_generacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas_servicios`
--
ALTER TABLE `areas_servicios`
  ADD PRIMARY KEY (`id_area`),
  ADD KEY `idx_nombre` (`nombre_area`),
  ADD KEY `idx_activa` (`activa`);

--
-- Indices de la tabla `asignaciones_medicos`
--
ALTER TABLE `asignaciones_medicos`
  ADD PRIMARY KEY (`id_asignacion_med`),
  ADD KEY `idx_medico` (`id_medico`),
  ADD KEY `idx_paciente` (`id_paciente`),
  ADD KEY `idx_sala` (`id_sala`),
  ADD KEY `idx_tipo` (`tipo_asignacion`),
  ADD KEY `idx_activa` (`activa`);

--
-- Indices de la tabla `auditoria_medicos`
--
ALTER TABLE `auditoria_medicos`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `idx_medico` (`id_medico`),
  ADD KEY `idx_tipo` (`tipo_cambio`),
  ADD KEY `idx_fecha` (`fecha_cambio`);

--
-- Indices de la tabla `documentos_profesionales`
--
ALTER TABLE `documentos_profesionales`
  ADD PRIMARY KEY (`id_documento`),
  ADD KEY `idx_medico` (`id_medico`),
  ADD KEY `idx_tipo` (`tipo_documento`),
  ADD KEY `idx_verificado` (`verificado`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id_especialidad`),
  ADD UNIQUE KEY `nombre_especialidad` (`nombre_especialidad`),
  ADD KEY `idx_nombre` (`nombre_especialidad`),
  ADD KEY `idx_activa` (`activa`);

--
-- Indices de la tabla `horarios_laborales`
--
ALTER TABLE `horarios_laborales`
  ADD PRIMARY KEY (`id_horario`),
  ADD UNIQUE KEY `unique_medico_dia` (`id_medico`,`dia_semana`),
  ADD KEY `idx_medico` (`id_medico`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD PRIMARY KEY (`id_medico`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `numero_licencia` (`numero_licencia`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_cedula` (`cedula`),
  ADD KEY `idx_estado` (`estado_registro`),
  ADD KEY `idx_especialidad` (`id_especialidad`),
  ADD KEY `idx_nombre_apellido` (`nombre`,`apellido`);
ALTER TABLE `medicos` ADD FULLTEXT KEY `ft_nombre_apellido` (`nombre`,`apellido`);

--
-- Indices de la tabla `medicos_areas`
--
ALTER TABLE `medicos_areas`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD UNIQUE KEY `unique_medico_area` (`id_medico`,`id_area`),
  ADD KEY `idx_medico` (`id_medico`),
  ADD KEY `idx_area` (`id_area`),
  ADD KEY `idx_activa` (`activa`);

--
-- Indices de la tabla `reportes_productividad`
--
ALTER TABLE `reportes_productividad`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `idx_medico` (`id_medico`),
  ADD KEY `idx_periodo` (`periodo_inicio`,`periodo_fin`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas_servicios`
--
ALTER TABLE `areas_servicios`
  MODIFY `id_area` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `asignaciones_medicos`
--
ALTER TABLE `asignaciones_medicos`
  MODIFY `id_asignacion_med` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auditoria_medicos`
--
ALTER TABLE `auditoria_medicos`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `documentos_profesionales`
--
ALTER TABLE `documentos_profesionales`
  MODIFY `id_documento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id_especialidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `horarios_laborales`
--
ALTER TABLE `horarios_laborales`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `medicos`
--
ALTER TABLE `medicos`
  MODIFY `id_medico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `medicos_areas`
--
ALTER TABLE `medicos_areas`
  MODIFY `id_asignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reportes_productividad`
--
ALTER TABLE `reportes_productividad`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignaciones_medicos`
--
ALTER TABLE `asignaciones_medicos`
  ADD CONSTRAINT `asignaciones_medicos_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE,
  ADD CONSTRAINT `asignaciones_medicos_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON DELETE SET NULL,
  ADD CONSTRAINT `asignaciones_medicos_ibfk_3` FOREIGN KEY (`id_sala`) REFERENCES `salas` (`id_sala`) ON DELETE SET NULL;

--
-- Filtros para la tabla `auditoria_medicos`
--
ALTER TABLE `auditoria_medicos`
  ADD CONSTRAINT `auditoria_medicos_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE;

--
-- Filtros para la tabla `documentos_profesionales`
--
ALTER TABLE `documentos_profesionales`
  ADD CONSTRAINT `documentos_profesionales_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios_laborales`
--
ALTER TABLE `horarios_laborales`
  ADD CONSTRAINT `horarios_laborales_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD CONSTRAINT `medicos_ibfk_1` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id_especialidad`);

--
-- Filtros para la tabla `medicos_areas`
--
ALTER TABLE `medicos_areas`
  ADD CONSTRAINT `medicos_areas_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE,
  ADD CONSTRAINT `medicos_areas_ibfk_2` FOREIGN KEY (`id_area`) REFERENCES `areas_servicios` (`id_area`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reportes_productividad`
--
ALTER TABLE `reportes_productividad`
  ADD CONSTRAINT `reportes_productividad_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
