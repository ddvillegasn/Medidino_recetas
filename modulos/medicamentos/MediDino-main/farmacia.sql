-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-11-2025 a las 18:46:31
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
-- Base de datos: `farmacia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerta`
--

CREATE TABLE `alerta` (
  `id_alerta` int(10) UNSIGNED NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha_generada` datetime NOT NULL DEFAULT current_timestamp(),
  `id_medicamento` int(10) UNSIGNED DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `visto` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alerta`
--

INSERT INTO `alerta` (`id_alerta`, `tipo`, `fecha_generada`, `id_medicamento`, `mensaje`, `visto`) VALUES
(2, 'stock_bajo', '2025-11-05 18:22:24', NULL, 'Stock bajo: 0', 0),
(3, 'stock_bajo', '2025-11-05 18:22:24', NULL, 'Stock bajo: 0', 0),
(4, 'stock_bajo', '2025-11-05 18:22:24', NULL, 'Stock bajo: 0', 0),
(5, 'stock_bajo', '2025-11-05 18:22:24', NULL, 'Stock bajo: 0', 0),
(6, 'stock_bajo', '2025-11-05 18:22:24', NULL, 'Stock bajo: 0', 0),
(8, 'stock_bajo', '2025-11-05 18:23:46', NULL, 'Stock bajo: 0', 0),
(9, 'stock_bajo', '2025-11-05 18:23:46', NULL, 'Stock bajo: 0', 0),
(10, 'stock_bajo', '2025-11-05 18:23:46', NULL, 'Stock bajo: 0', 0),
(11, 'stock_bajo', '2025-11-05 18:23:46', NULL, 'Stock bajo: 0', 0),
(12, 'stock_bajo', '2025-11-05 18:23:46', NULL, 'Stock bajo: 0', 0),
(13, 'stock_bajo', '2025-11-05 19:04:24', NULL, 'Stock bajo: 0', 0),
(14, 'stock_bajo', '2025-11-08 09:10:58', NULL, 'Stock bajo: 10', 0),
(15, 'stock_bajo', '2025-11-08 11:05:54', NULL, 'Stock bajo: 10', 0),
(16, 'stock_bajo', '2025-11-12 11:32:38', 11, 'Stock bajo: 0', 0),
(17, 'stock_bajo', '2025-11-12 12:11:53', 20, 'Stock bajo: 10', 0),
(18, 'stock_bajo', '2025-11-12 12:15:00', 14, 'Stock bajo: 0', 0),
(19, 'stock_bajo', '2025-11-12 12:15:12', 11, 'Stock bajo: 0', 0),
(20, 'stock_bajo', '2025-11-12 12:15:52', 13, 'Stock bajo: 20', 0),
(21, 'stock_bajo', '2025-11-12 12:16:11', 17, 'Stock bajo: 10', 0),
(22, 'stock_bajo', '2025-11-19 14:28:01', 21, 'Stock bajo: 0', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dispensacion`
--

CREATE TABLE `dispensacion` (
  `id_dispensacion` int(10) UNSIGNED NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `cantidad` int(11) NOT NULL,
  `id_medicamento` int(10) UNSIGNED NOT NULL,
  `id_usuario_farmaceutico` int(10) UNSIGNED DEFAULT NULL,
  `id_solicitud` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dispensaciones`
--

CREATE TABLE `dispensaciones` (
  `id_dispensacion` int(11) NOT NULL,
  `id_medicamento` int(11) NOT NULL,
  `nombre_medicamento` varchar(255) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `paciente` varchar(255) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `medico` varchar(255) DEFAULT NULL,
  `numero_receta` varchar(50) DEFAULT NULL,
  `indicaciones` longtext DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento`
--

CREATE TABLE `medicamento` (
  `id_medicamento` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dosis_recomendada` varchar(255) DEFAULT NULL,
  `efectos_secundarios` text DEFAULT NULL,
  `contraindicaciones` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT 0.00,
  `estado` enum('activo','inactivo','retirado') NOT NULL DEFAULT 'activo',
  `fecha_vencimiento` date DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `minimo_stock` int(11) NOT NULL DEFAULT 5,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medicamento`
--

INSERT INTO `medicamento` (`id_medicamento`, `nombre`, `descripcion`, `dosis_recomendada`, `efectos_secundarios`, `contraindicaciones`, `categoria`, `tipo`, `precio`, `estado`, `fecha_vencimiento`, `stock`, `minimo_stock`, `creado_en`, `actualizado_en`) VALUES
(11, 'Diclofenaco ', 'es un antiinflamatorio no esteroideo (AINE) que se usa para tratar el dolor leve a moderado y ayuda a aliviar los síntomas de la artritis (p. ej., osteoartritis o artritis reumatoide), como inflamación, hinchazón, rigidez y dolor articular.', '1 capsula cada 12 horas ', 'diarrea.\nestreñimiento.\ngases o distensión abdominal,\ndolor de cabeza.\nmareos.\nzumbido en los oídos.', 'Las tabletas y cápsulas de diclofenaco pueden provocar una úlcera en el estómago si las toma durante mucho tiempo o en grandes dosis, o si es una persona mayor o tiene mala salud en general. Si tiene o ha tenido una úlcera estomacal, es posible que no pueda tomar diclofenaco en comprimidos o cápsulas.', 'antiinflamatorio', 'capsulas', 2500.00, 'activo', '2026-11-25', 0, 20, '2025-11-12 11:31:14', '2025-11-12 12:15:12'),
(12, 'Paracetamol 500 mg', 'Alivia dolor leve a moderado y fiebre.', '1 tableta cada 6-8 h (máx. 3 g/día)', 'Náuseas, malestar gástrico, raramente elevación de enzimas hepáticas.', 'Insuficiencia hepática severa, alergia al paracetamol, consumo excesivo de alcohol.', 'analgesico', 'tabletas', 1200.00, 'activo', '2027-03-15', 120, 30, '2025-11-12 11:43:35', '2025-11-12 11:43:35'),
(13, 'Ibuprofeno 400 mg', 'Dolor e inflamación de diversa etiología.', '1 tableta cada 8 h con alimentos', 'Dispepsia, mareo, somnolencia; raramente sangrado GI.', 'Úlcera activa, insuficiencia renal grave, embarazo tercer trimestre.', 'antiinflamatorio', 'tabletas', 1500.00, 'activo', '2025-11-13', 20, 25, '2025-11-12 11:46:29', '2025-11-12 12:54:49'),
(14, 'Amoxicilina 500 mg', 'Infecciones bacterianas sensibles.', '1 cápsula cada 8 h por 7-10 días', 'Diarrea, rash cutáneo, náuseas.', 'Alergia a penicilinas/β-lactámicos.', 'antibiotico', 'capsulas', 2200.00, 'activo', '2026-02-05', 1500, 20, '2025-11-12 11:49:23', '2025-11-12 12:24:41'),
(15, 'Omeprazol 20 mg', 'Tratamiento de reflujo gastroesofágico y úlcera péptica.', '1 cápsula al día antes del desayuno', 'Dolor abdominal, cefalea, flatulencia.', 'Hipersensibilidad a benzimidazoles, uso concomitante con nelfinavir.', 'otros', 'capsulas', 1800.00, 'activo', '2027-08-30', 110, 30, '2025-11-12 11:52:10', '2025-11-12 11:52:10'),
(16, 'Loratadina 10 mg', 'Rinitis alérgica y urticaria.', '1 tableta al día', 'Somnolencia leve, sequedad de boca.', 'Hipersensibilidad conocida, precaución en insuficiencia hepática.', 'otros', 'tabletas', 1300.00, 'activo', '2025-05-12', 140, 35, '2025-11-12 11:54:38', '2025-11-12 11:54:38'),
(17, 'Metformina 850 mg', 'Control de glucemia en diabetes tipo 2.', '1 tableta cada 12 h con comidas', 'Malestar GI, diarrea; raramente acidosis láctica.', 'Insuficiencia renal moderada-severa (TFG<45), insuficiencia hepática, alcoholismo.', 'antibiotico', 'tabletas', 900.00, 'activo', '2025-11-13', 10, 20, '2025-11-12 11:57:23', '2025-11-12 12:54:11'),
(18, 'Losartán 50 mg', 'Hipertensión arterial y nefroprotección en diabéticos.', '1 tableta al día', 'Mareos, hiperpotasemia, hipotensión.', 'Embarazo, hiperpotasemia significativa.', 'otros', 'tabletas', 2000.00, 'activo', '2027-09-09', 70, 20, '2025-11-12 12:00:06', '2025-11-12 12:00:06'),
(19, 'Salbutamol 100 mcg/dosis', 'Alivio de broncoespasmo en asma/EPOC.', '1–2 inhalaciones cada 4–6 h según necesidad', 'Temblor, taquicardia, nerviosismo.', 'Hipersensibilidad; precaución en cardiopatía.', 'otros', 'gotas', 18000.00, 'activo', '2025-11-13', 10, 10, '2025-11-12 12:03:03', '2025-11-12 13:21:49'),
(20, 'Diclofenaco Gel 1% 60 g', 'Alivio local de dolor e inflamación muscular/articular.', 'Aplicar capa fina 3–4 veces al día', 'Irritación local, eritema.', 'Piel lesionada, alergia a AINEs, tercer trimestre de embarazo.', 'antiinflamatorio', 'crema', 9500.00, 'activo', '2026-04-03', 0, 15, '2025-11-12 12:05:35', '2025-11-12 12:12:20'),
(21, 'Sales de Rehidratación Oral 500 mL', 'Reposición de líquidos y electrolitos en diarrea.', 'Según deshidratación; 50–100 mL/kg en 4 h', 'Náuseas, vómitos ocasionales.', 'Obstrucción intestinal, shock; valorar en insuficiencia renal.', 'otros', 'jarabe', 3500.00, 'activo', '2025-12-13', 0, 25, '2025-11-12 12:09:31', '2025-11-19 14:28:01');

--
-- Disparadores `medicamento`
--
DELIMITER $$
CREATE TRIGGER `tr_stock_bajo` AFTER UPDATE ON `medicamento` FOR EACH ROW BEGIN
  IF NEW.stock < NEW.minimo_stock AND (OLD.stock IS NULL OR OLD.stock >= OLD.minimo_stock) THEN
    INSERT INTO alerta(tipo, id_medicamento, mensaje) VALUES('stock_bajo', NEW.id_medicamento, CONCAT('Stock bajo: ', NEW.stock));
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimiento_inventario`
--

CREATE TABLE `movimiento_inventario` (
  `id_movimiento` int(10) UNSIGNED NOT NULL,
  `tipo` enum('entrada','salida','ajuste') NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `cantidad` int(11) NOT NULL,
  `id_medicamento` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `movimiento_inventario`
--
DELIMITER $$
CREATE TRIGGER `tr_movimiento_update_stock` AFTER INSERT ON `movimiento_inventario` FOR EACH ROW BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE medicamento SET stock = stock + NEW.cantidad WHERE id_medicamento = NEW.id_medicamento;
  ELSEIF NEW.tipo = 'salida' THEN
    UPDATE medicamento SET stock = stock - NEW.cantidad WHERE id_medicamento = NEW.id_medicamento;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recordatorio`
--

CREATE TABLE `recordatorio` (
  `id_recordatorio` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `tipo` enum('vencimiento','restock','revision','mantenimiento','otro') NOT NULL,
  `fecha_prevista` datetime NOT NULL,
  `frecuencia` enum('unica','diaria','semanal','mensual') DEFAULT 'unica',
  `descripcion` text DEFAULT NULL,
  `estado` enum('activo','completado','cancelado') DEFAULT 'activo',
  `proxima_ejecucion` datetime DEFAULT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `recordatorio`
--

INSERT INTO `recordatorio` (`id_recordatorio`, `titulo`, `tipo`, `fecha_prevista`, `frecuencia`, `descripcion`, `estado`, `proxima_ejecucion`, `creado_en`, `actualizado_en`) VALUES
(1, 'Recordatorio de Prueba 1762629292685', 'vencimiento', '2025-11-10 00:14:00', 'unica', 'Esto es un recordatorio de prueba del debugger', 'cancelado', '2025-11-09 19:14:00', '2025-11-08 14:14:52', '2025-11-08 14:53:31'),
(2, 'Eliminar medicamento', 'vencimiento', '2025-11-07 14:59:00', 'unica', 'Hay un medicamento vencido en el stock', 'cancelado', '2025-11-07 14:59:00', '2025-11-08 15:00:42', '2025-11-08 15:00:54'),
(3, 'Registrar nuevos medicamentos', 'restock', '2025-11-13 16:56:00', 'diaria', 'Actualizar y registrar nuevos medicamentos ya que se cambio el laboratorio que los proporcionaba', 'cancelado', '2025-11-13 11:56:00', '2025-11-10 11:52:51', '2025-11-12 12:26:03'),
(4, 'Stock bajo Salbutamol', 'restock', '2025-11-12 16:30:00', 'unica', 'Hay medicamentos con stock bajo', 'activo', '2025-11-12 16:30:00', '2025-11-12 12:28:59', '2025-11-12 12:28:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitud`
--

CREATE TABLE `solicitud` (
  `id_solicitud` int(10) UNSIGNED NOT NULL,
  `fecha_solicitud` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario_solicitante` int(10) UNSIGNED DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada','atendida','eliminada') DEFAULT 'pendiente',
  `detalles` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `solicitud`
--

INSERT INTO `solicitud` (`id_solicitud`, `fecha_solicitud`, `id_usuario_solicitante`, `estado`, `detalles`) VALUES
(1, '2025-09-17 15:00:09', 1, 'eliminada', 'Solicitud ejemplo'),
(4, '2025-11-12 12:23:34', NULL, 'eliminada', '{\"medicamento\":\"Amoxicilina 500 mg\",\"cantidad\":1500,\"prioridad\":\"urgente\",\"area\":\"Farmacia\",\"justificacion\":\"No hay en el stock de medicamentos\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `rol` enum('farmaceutico','auxiliar','administrador','medico','admin','cliente','otro') DEFAULT 'farmaceutico',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `email`, `rol`, `creado_en`) VALUES
(1, 'Laura Quintero', 'laura@example.com', 'administrador', '2025-09-17 15:00:09'),
(2, 'Javier Munoz', 'javi25@gmail.com', 'farmaceutico', '2025-11-08 15:42:40'),
(3, 'Marcela Montoya', 'marce98@gmail.com', 'administrador', '2025-11-08 15:49:07'),
(4, 'Carolina Plazas', 'carito89@gmail.com', 'medico', '2025-11-08 15:53:49');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alerta`
--
ALTER TABLE `alerta`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `idx_alerta_medicamento` (`id_medicamento`);

--
-- Indices de la tabla `dispensacion`
--
ALTER TABLE `dispensacion`
  ADD PRIMARY KEY (`id_dispensacion`),
  ADD KEY `idx_dispensacion_medicamento` (`id_medicamento`),
  ADD KEY `idx_dispensacion_usuario` (`id_usuario_farmaceutico`),
  ADD KEY `idx_dispensacion_solicitud` (`id_solicitud`);

--
-- Indices de la tabla `dispensaciones`
--
ALTER TABLE `dispensaciones`
  ADD PRIMARY KEY (`id_dispensacion`),
  ADD KEY `id_medicamento` (`id_medicamento`),
  ADD KEY `fecha` (`fecha`);

--
-- Indices de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  ADD PRIMARY KEY (`id_medicamento`),
  ADD KEY `idx_medicamento_nombre` (`nombre`);

--
-- Indices de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD PRIMARY KEY (`id_movimiento`),
  ADD KEY `idx_movimiento_medicamento` (`id_medicamento`),
  ADD KEY `idx_movimiento_usuario` (`id_usuario`);

--
-- Indices de la tabla `recordatorio`
--
ALTER TABLE `recordatorio`
  ADD PRIMARY KEY (`id_recordatorio`),
  ADD KEY `idx_fecha` (`fecha_prevista`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_recordatorio_estado_fecha` (`estado`,`fecha_prevista`);

--
-- Indices de la tabla `solicitud`
--
ALTER TABLE `solicitud`
  ADD PRIMARY KEY (`id_solicitud`),
  ADD KEY `idx_solicitud_usuario` (`id_usuario_solicitante`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alerta`
--
ALTER TABLE `alerta`
  MODIFY `id_alerta` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `dispensacion`
--
ALTER TABLE `dispensacion`
  MODIFY `id_dispensacion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `dispensaciones`
--
ALTER TABLE `dispensaciones`
  MODIFY `id_dispensacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  MODIFY `id_medicamento` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  MODIFY `id_movimiento` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `recordatorio`
--
ALTER TABLE `recordatorio`
  MODIFY `id_recordatorio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `solicitud`
--
ALTER TABLE `solicitud`
  MODIFY `id_solicitud` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alerta`
--
ALTER TABLE `alerta`
  ADD CONSTRAINT `fk_alerta_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `dispensacion`
--
ALTER TABLE `dispensacion`
  ADD CONSTRAINT `fk_dispensacion_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dispensacion_solicitud` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitud` (`id_solicitud`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dispensacion_usuario` FOREIGN KEY (`id_usuario_farmaceutico`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimiento_inventario`
--
ALTER TABLE `movimiento_inventario`
  ADD CONSTRAINT `fk_movimiento_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitud`
--
ALTER TABLE `solicitud`
  ADD CONSTRAINT `fk_solicitud_usuario` FOREIGN KEY (`id_usuario_solicitante`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
