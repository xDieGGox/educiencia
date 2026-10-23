// =========================================================
// EDUCIENCIA · Tabla Periódica Inmersiva 3D
// Aplicación modular Three.js vanilla (ES modules)
// =========================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// =========================================================
// DATOS DE LOS 118 ELEMENTOS QUÍMICOS
// Fuente: datos públicos IUPAC
// =========================================================
// family: alkali | alkaline | transition | postTransition | metalloid
//         | nonmetal | halogen | noble | lanthanide | actinide | unknown
// state: solid | liquid | gas | synthetic
// group/period: posición en la tabla periódica

const ELEMENTS = [
  {z:1,  sym:'H',  name:'Hidrógeno',   nameEn:'Hydrogen',     mass:1.008,    family:'nonmetal',  state:'gas',    group:1, period:1, config:'1s¹',           melt:-259, boil:-253, discovered:1766, usos:'Combustibles, producción de amoníaco, industria alimentaria.', curio:'Es el elemento más abundante del universo (≈75% de su masa).' },
  {z:2,  sym:'He', name:'Helio',       nameEn:'Helium',       mass:4.0026,   family:'noble',     state:'gas',    group:18,period:1, config:'1s²',           melt:-272, boil:-269, discovered:1868, usos:'Globos, gas de elevación, refrigerante criogénico.', curio:'Solo elemento que no puede solidificarse por enfriamiento a presión normal.' },
  {z:3,  sym:'Li', name:'Litio',       nameEn:'Lithium',      mass:6.94,     family:'alkali',    state:'solid',  group:1, period:2, config:'[He] 2s¹',      melt:181,  boil:1342, discovered:1817, usos:'Baterías recargables, cerámicas, lubricantes.', curio:'Es el metal más ligero y puede flotar en aceite.' },
  {z:4,  sym:'Be', name:'Berilio',     nameEn:'Beryllium',    mass:9.0122,   family:'alkaline',  state:'solid',  group:2, period:2, config:'[He] 2s²',      melt:1287, boil:2469, discovered:1798, usos:'Aleaciones para aeroespacial, ventanas de rayos X.', curio:'Transparente a los rayos X, se usa en aplicaciones nucleares.' },
  {z:5,  sym:'B',  name:'Boro',        nameEn:'Boron',        mass:10.81,    family:'metalloid', state:'solid',  group:13,period:2, config:'[He] 2s² 2p¹',  melt:2076, boil:3927, discovered:1808, usos:'Vidrios borosilicato (Pyrex), semiconductores, fertilizantes.', curio:'Esencial en trazas para el crecimiento de las plantas.' },
  {z:6,  sym:'C',  name:'Carbono',     nameEn:'Carbon',       mass:12.011,   family:'nonmetal',  state:'solid',  group:14,period:2, config:'[He] 2s² 2p²',  melt:3550, boil:4827, discovered:-3750, usos:'Base de la vida, acero, diamantes, grafito, nanotubos.', curio:'Forma más compuestos que cualquier otro elemento (salvo el H).' },
  {z:7,  sym:'N',  name:'Nitrógeno',   nameEn:'Nitrogen',     mass:14.007,   family:'nonmetal',  state:'gas',    group:15,period:2, config:'[He] 2s² 2p³',  melt:-210, boil:-196, discovered:1772, usos:'Fertilizantes, conservación de alimentos, criogenia.', curio:'Constituye el 78% del aire que respiras.' },
  {z:8,  sym:'O',  name:'Oxígeno',     nameEn:'Oxygen',       mass:15.999,   family:'nonmetal',  state:'gas',    group:16,period:2, config:'[He] 2s² 2p⁴',  melt:-218, boil:-183, discovered:1774, usos:'Respiración, combustión, soldadura, medicina.', curio:'Representa el 21% del aire y el 65% de tu cuerpo.' },
  {z:9,  sym:'F',  name:'Flúor',       nameEn:'Fluorine',     mass:18.998,   family:'halogen',   state:'gas',    group:17,period:2, config:'[He] 2s² 2p⁵',  melt:-220, boil:-188, discovered:1886, usos:'Pastas dentales, refrigerantes, teflón.', curio:'Es el elemento más electronegativo y reactivo de todos.' },
  {z:10, sym:'Ne', name:'Neón',        nameEn:'Neon',         mass:20.180,   family:'noble',     state:'gas',    group:18,period:2, config:'[He] 2s² 2p⁶',  melt:-249, boil:-246, discovered:1898, usos:'Letreros luminosos, láseres, tubos de descarga.', curio:'Su nombre significa "nuevo" en griego.' },
  {z:11, sym:'Na', name:'Sodio',       nameEn:'Sodium',       mass:22.990,   family:'alkali',    state:'solid',  group:1, period:3, config:'[Ne] 3s¹',      melt:98,   boil:883,  discovered:1807, usos:'Sal común, alumbrado urbano (vapor de sodio), jabón.', curio:'Reacciona violentamente con agua y puede explotar.' },
  {z:12, sym:'Mg', name:'Magnesio',    nameEn:'Magnesium',    mass:24.305,   family:'alkaline',  state:'solid',  group:2, period:3, config:'[Ne] 3s²',      melt:650,  boil:1090, discovered:1755, usos:'Aleaciones ligeras, fuegos artificiales, clorofila.', curio:'Arde con una llama blanca intensa; se usaba en flashes fotográficos.' },
  {z:13, sym:'Al', name:'Aluminio',    nameEn:'Aluminium',    mass:26.982,   family:'postTransition', state:'solid', group:13,period:3, config:'[Ne] 3s² 3p¹', melt:660, boil:2519, discovered:1825, usos:'Envases, transporte, construcción, electrónica.', curio:'Es el metal más abundante de la corteza terrestre.' },
  {z:14, sym:'Si', name:'Silicio',     nameEn:'Silicon',      mass:28.085,   family:'metalloid', state:'solid',  group:14,period:3, config:'[Ne] 3s² 3p²',  melt:1414, boil:3265, discovered:1824, usos:'Microchips, celdas solares, vidrio, cerámicas.', curio:'Segundo elemento más abundante de la corteza (después del oxígeno).' },
  {z:15, sym:'P',  name:'Fósforo',     nameEn:'Phosphorus',   mass:30.974,   family:'nonmetal',  state:'solid',  group:15,period:3, config:'[Ne] 3s² 3p³',  melt:44,   boil:281,  discovered:1669, usos:'Fertilizantes, cerillas, ADN, bombillas fluorescentes.', curio:'El fósforo blanco brilla en la oscuridad por oxidación lenta.' },
  {z:16, sym:'S',  name:'Azufre',      nameEn:'Sulfur',       mass:32.06,    family:'nonmetal',  state:'solid',  group:16,period:3, config:'[Ne] 3s² 3p⁴',  melt:115,  boil:445,  discovered:-2000, usos:'Ácido sulfúrico, pólvora, vulcanización del caucho.', curio:'Conocido desde la antigüedad; mencionado en la Biblia como "piedra ardiente".' },
  {z:17, sym:'Cl', name:'Cloro',       nameEn:'Chlorine',     mass:35.45,    family:'halogen',   state:'gas',    group:17,period:3, config:'[Ne] 3s² 3p⁵',  melt:-102, boil:-34,  discovered:1774, usos:'Desinfección de agua, PVC, lejía, sal de mesa.', curio:'Usado como arma química en la Primera Guerra Mundial.' },
  {z:18, sym:'Ar', name:'Argón',       nameEn:'Argon',        mass:39.948,   family:'noble',     state:'gas',    group:18,period:3, config:'[Ne] 3s² 3p⁶',  melt:-189, boil:-186, discovered:1894, usos:'Bombillas incandescentes, soldadura, conservación.', curio:'Su nombre significa "perezoso" por su falta de reactividad.' },
  {z:19, sym:'K',  name:'Potasio',     nameEn:'Potassium',    mass:39.098,   family:'alkali',    state:'solid',  group:1, period:4, config:'[Ar] 4s¹',      melt:64,   boil:759,  discovered:1807, usos:'Fertilizantes, jabón, plátanos, nervios y músculos.', curio:'Reacciona tan fuerte con agua que la llama se vuelve violeta.' },
  {z:20, sym:'Ca', name:'Calcio',      nameEn:'Calcium',      mass:40.078,   family:'alkaline',  state:'solid',  group:2, period:4, config:'[Ar] 4s²',      melt:842,  boil:1484, discovered:1808, usos:'Huesos, dientes, cemento, yeso, tiza.', curio:'El 99% del calcio del cuerpo humano está en los huesos y dientes.' },
  {z:21, sym:'Sc', name:'Escandio',    nameEn:'Scandium',     mass:44.956,   family:'transition',state:'solid',  group:3, period:4, config:'[Ar] 3d¹ 4s²',  melt:1541, boil:2836, discovered:1879, usos:'Aleaciones aeroespaciales, lámparas de mercurio.', curio:'Descubierto por Nilson; predicho por Mendeleiev como "ekaboro".' },
  {z:22, sym:'Ti', name:'Titanio',     nameEn:'Titanium',     mass:47.867,   family:'transition',state:'solid',  group:4, period:4, config:'[Ar] 3d² 4s²',  melt:1668, boil:3287, discovered:1791, usos:'Implantes médicos, aeronáutica, pigmentos blancos.', curio:'Fuerte como el acero pero 45% más ligero; resistente a corrosión.' },
  {z:23, sym:'V',  name:'Vanadio',     nameEn:'Vanadium',     mass:50.942,   family:'transition',state:'solid',  group:5, period:4, config:'[Ar] 3d³ 4s²',  melt:1910, boil:3407, discovered:1801, usos:'Aceros de alta resistencia, baterías de flujo.', curio:'Nombrado por la diosa escandinava Vanadis por sus compuestos coloridos.' },
  {z:24, sym:'Cr', name:'Cromo',       nameEn:'Chromium',     mass:51.996,   family:'transition',state:'solid',  group:6, period:4, config:'[Ar] 3d⁵ 4s¹',  melt:1907, boil:2671, discovered:1797, usos:'Acero inoxidable, cromados, pigmentos verdes.', curio:'Su nombre viene del griego "chroma" (color).' },
  {z:25, sym:'Mn', name:'Manganeso',   nameEn:'Manganese',    mass:54.938,   family:'transition',state:'solid',  group:7, period:4, config:'[Ar] 3d⁵ 4s²',  melt:1246, boil:2061, discovered:1774, usos:'Acero, baterías secas, fertilizantes.', curio:'Esencial para la fotosíntesis: rompe el agua liberando O₂.' },
  {z:26, sym:'Fe', name:'Hierro',      nameEn:'Iron',         mass:55.845,   family:'transition',state:'solid',  group:8, period:4, config:'[Ar] 3d⁶ 4s²',  melt:1538, boil:2862, discovered:-5000, usos:'Acero, construcción, hemoglobina, núcleo terrestre.', curio:'El núcleo de la Tierra es principalmente hierro; lo que da el campo magnético.' },
  {z:27, sym:'Co', name:'Cobalto',     nameEn:'Cobalt',       mass:58.933,   family:'transition',state:'solid',  group:9, period:4, config:'[Ar] 3d⁷ 4s²',  melt:1495, boil:2927, discovered:1735, usos:'Baterías de litio, aleaciones magnéticas, vitamina B12.', curio:'Su nombre viene del alemán "kobold" (duende de las minas).' },
  {z:28, sym:'Ni', name:'Níquel',      nameEn:'Nickel',       mass:58.693,   family:'transition',state:'solid',  group:10,period:4, config:'[Ar] 3d⁸ 4s²',  melt:1455, boil:2913, discovered:1751, usos:'Acero inoxidable, monedas, baterías recargables.', curio:'Su nombre significa "diablillo" — los mineros creían que engañaba al cobre.' },
  {z:29, sym:'Cu', name:'Cobre',       nameEn:'Copper',       mass:63.546,   family:'transition',state:'solid',  group:11,period:4, config:'[Ar] 3d¹⁰ 4s¹', melt:1085, boil:2562, discovered:-9000, usos:'Cables eléctricos, tuberías, monedas, electrónica.', curio:'Uno de los primeros metales usados por el hombre (Edad del Cobre).' },
  {z:30, sym:'Zn', name:'Zinc',        nameEn:'Zinc',         mass:65.38,    family:'transition',state:'solid',  group:12,period:4, config:'[Ar] 3d¹⁰ 4s²', melt:420,  boil:907,  discovered:1500, usos:'Galvanizado, latón, pilas, suplemento nutricional.', curio:'Cada célula de tu cuerpo necesita zinc para funcionar correctamente.' },
  {z:31, sym:'Ga', name:'Galio',       nameEn:'Gallium',      mass:69.723,   family:'postTransition', state:'solid', group:13,period:4, config:'[Ar] 3d¹⁰ 4s² 4p¹', melt:30, boil:2229, discovered:1875, usos:'LEDs azules, semiconductores, termómetros.', curio:'Se funde en tu mano (temperatura de fusión: 29.76 °C).' },
  {z:32, sym:'Ge', name:'Germanio',    nameEn:'Germanium',    mass:72.630,   family:'metalloid', state:'solid',  group:14,period:4, config:'[Ar] 3d¹⁰ 4s² 4p²', melt:938, boil:2833, discovered:1886, usos:'Fibra óptica, infrarrojos, semiconductores.', curio:'Mendeleiev predijo su existencia y propiedades 15 años antes de su descubrimiento.' },
  {z:33, sym:'As', name:'Arsénico',    nameEn:'Arsenic',      mass:74.922,   family:'metalloid', state:'solid',  group:15,period:4, config:'[Ar] 3d¹⁰ 4s² 4p³', melt:817, boil:614, discovered:1250, usos:'Semiconductores, plaguicidas (prohibidos), medicina.', curio:'Famoso veneno histórico; hoy se usa para tratar leucemia.' },
  {z:34, sym:'Se', name:'Selenio',     nameEn:'Selenium',     mass:78.971,   family:'nonmetal',  state:'solid',  group:16,period:4, config:'[Ar] 3d¹⁰ 4s² 4p⁴', melt:221, boil:685, discovered:1817, usos:'Células fotoeléctricas, champú anticaspa, vidrio.', curio:'Su conductividad eléctrica aumenta con la luz — primer fotoconductor descubierto.' },
  {z:35, sym:'Br', name:'Bromo',       nameEn:'Bromine',      mass:79.904,   family:'halogen',   state:'liquid', group:17,period:4, config:'[Ar] 3d¹⁰ 4s² 4p⁵', melt:-7, boil:59, discovered:1826, usos:'Retardantes de llama, tratamiento de aguas, fotografía.', curio:'Uno de los dos únicos elementos líquidos a temperatura ambiente.' },
  {z:36, sym:'Kr', name:'Kriptón',     nameEn:'Krypton',      mass:83.798,   family:'noble',     state:'gas',    group:18,period:4, config:'[Ar] 3d¹⁰ 4s² 4p⁶', melt:-157, boil:-153, discovered:1898, usos:'Bombillas de alta eficiencia, láseres, flashes fotográficos.', curio:'Su nombre significa "oculto" en griego; no tiene nada que ver con Superman.' },
  {z:37, sym:'Rb', name:'Rubidio',     nameEn:'Rubidium',     mass:85.468,   family:'alkali',    state:'solid',  group:1, period:5, config:'[Kr] 5s¹',          melt:39, boil:688, discovered:1861, usos:'Relojes atómicos, células fotoeléctricas, investigación.', curio:'Su nombre viene del latín "rubidus" (rojo oscuro) por sus líneas espectrales.' },
  {z:38, sym:'Sr', name:'Estroncio',   nameEn:'Strontium',    mass:87.62,    family:'alkaline',  state:'solid',  group:2, period:5, config:'[Kr] 5s²',          melt:777, boil:1382, discovered:1790, usos:'Fuegos artificiales rojos, imanes, tubos de TV antiguos.', curio:'El estroncio-90 es un subproducto peligroso de la fisión nuclear.' },
  {z:39, sym:'Y',  name:'Itrio',       nameEn:'Yttrium',      mass:88.906,   family:'transition',state:'solid',  group:3, period:5, config:'[Kr] 4d¹ 5s²',      melt:1522, boil:3345, discovered:1794, usos:'LEDs, superconductores, láseres YAG, pantallas.', curio:'Nombrado por Ytterby, pueblo sueco que da nombre a cuatro elementos.' },
  {z:40, sym:'Zr', name:'Circonio',    nameEn:'Zirconium',    mass:91.224,   family:'transition',state:'solid',  group:4, period:5, config:'[Kr] 4d² 5s²',      melt:1855, boil:4409, discovered:1789, usos:'Reactores nucleares, joyería (zirconita), cerámicas.', curio:'El óxido de circonio imita al diamante — es el popular "zirconita cúbica".' },
  {z:41, sym:'Nb', name:'Niobio',      nameEn:'Niobium',      mass:92.906,   family:'transition',state:'solid',  group:5, period:5, config:'[Kr] 4d⁴ 5s¹',      melt:2477, boil:4744, discovered:1801, usos:'Superconductores, aleaciones para aviones, monedas.', curio:'Nombrado por Níobe, hija de Tántalo en la mitología griega.' },
  {z:42, sym:'Mo', name:'Molibdeno',   nameEn:'Molybdenum',   mass:95.95,    family:'transition',state:'solid',  group:6, period:5, config:'[Kr] 4d⁵ 5s¹',      melt:2623, boil:4639, discovered:1778, usos:'Aceros duros, lubricantes, catalizadores.', curio:'Esencial en enzimas que fijan el nitrógeno atmosférico.' },
  {z:43, sym:'Tc', name:'Tecnecio',    nameEn:'Technetium',   mass:98,       family:'transition',state:'synthetic', group:7, period:5, config:'[Kr] 4d⁵ 5s²', melt:2157, boil:4265, discovered:1937, usos:'Medicina nuclear (imágenes), investigación.', curio:'Primer elemento artificial producido; su nombre significa "artificial".' },
  {z:44, sym:'Ru', name:'Rutenio',     nameEn:'Ruthenium',    mass:101.07,   family:'transition',state:'solid',  group:8, period:5, config:'[Kr] 4d⁷ 5s¹',      melt:2334, boil:4150, discovered:1844, usos:'Contactos eléctricos, plumas estilográficas, catalizadores.', curio:'Nombrado por Rusia (Ruthenia en latín).' },
  {z:45, sym:'Rh', name:'Rodio',       nameEn:'Rhodium',      mass:102.91,   family:'transition',state:'solid',  group:9, period:5, config:'[Kr] 4d⁸ 5s¹',      melt:1964, boil:3695, discovered:1803, usos:'Catalizadores de autos, joyería, espejos.', curio:'Uno de los metales más caros y raros de la Tierra.' },
  {z:46, sym:'Pd', name:'Paladio',     nameEn:'Palladium',    mass:106.42,   family:'transition',state:'solid',  group:10,period:5, config:'[Kr] 4d¹⁰',         melt:1555, boil:2963, discovered:1803, usos:'Convertidores catalíticos, electrónica, joyería.', curio:'Puede absorber 900 veces su propio volumen en hidrógeno.' },
  {z:47, sym:'Ag', name:'Plata',       nameEn:'Silver',       mass:107.87,   family:'transition',state:'solid',  group:11,period:5, config:'[Kr] 4d¹⁰ 5s¹',     melt:962, boil:2162, discovered:-3000, usos:'Joyería, fotografía, electrónica, antibacterianos.', curio:'Es el mejor conductor eléctrico y térmico de todos los metales.' },
  {z:48, sym:'Cd', name:'Cadmio',      nameEn:'Cadmium',      mass:112.41,   family:'transition',state:'solid',  group:12,period:5, config:'[Kr] 4d¹⁰ 5s²',     melt:321, boil:767, discovered:1817, usos:'Baterías Ni-Cd, pigmentos amarillos, galvanizado.', curio:'Altamente tóxico; el "mal de itai-itai" en Japón fue por contaminación de cadmio.' },
  {z:49, sym:'In', name:'Indio',       nameEn:'Indium',       mass:114.82,   family:'postTransition', state:'solid', group:13,period:5, config:'[Kr] 4d¹⁰ 5s² 5p¹', melt:157, boil:2072, discovered:1863, usos:'Pantallas LCD/OLED, soldaduras de baja temperatura.', curio:'Produce un "chirrido" al doblarse, llamado "grito del indio".' },
  {z:50, sym:'Sn', name:'Estaño',      nameEn:'Tin',          mass:118.71,   family:'postTransition', state:'solid', group:14,period:5, config:'[Kr] 4d¹⁰ 5s² 5p²', melt:232, boil:2602, discovered:-3000, usos:'Conservas, soldaduras, bronce, recubrimientos.', curio:'A bajas temperaturas se desmorona en polvo — la "peste del estaño".' },
  {z:51, sym:'Sb', name:'Antimonio',   nameEn:'Antimony',     mass:121.76,   family:'metalloid', state:'solid',  group:15,period:5, config:'[Kr] 4d¹⁰ 5s² 5p³', melt:631, boil:1587, discovered:-3000, usos:'Aleaciones, retardantes de llama, baterías.', curio:'Usado por egipcios como cosmético (kohl) para oscurecer ojos.' },
  {z:52, sym:'Te', name:'Telurio',     nameEn:'Tellurium',    mass:127.60,   family:'metalloid', state:'solid',  group:16,period:5, config:'[Kr] 4d¹⁰ 5s² 5p⁴', melt:450, boil:988, discovered:1782, usos:'Celdas solares, aleaciones, CDs regrabables.', curio:'Su nombre viene de "tellus" (tierra en latín).' },
  {z:53, sym:'I',  name:'Yodo',        nameEn:'Iodine',       mass:126.90,   family:'halogen',   state:'solid',  group:17,period:5, config:'[Kr] 4d¹⁰ 5s² 5p⁵', melt:114, boil:184, discovered:1811, usos:'Antisépticos, sal yodada, contraste médico, nutrición tiroidea.', curio:'Sublima directamente de sólido a gas violeta intenso.' },
  {z:54, sym:'Xe', name:'Xenón',       nameEn:'Xenon',        mass:131.29,   family:'noble',     state:'gas',    group:18,period:5, config:'[Kr] 4d¹⁰ 5s² 5p⁶', melt:-112, boil:-108, discovered:1898, usos:'Faros de automóvil, lámparas flash, propulsión iónica.', curio:'Usado en motores iónicos de sondas espaciales como Dawn.' },
  {z:55, sym:'Cs', name:'Cesio',       nameEn:'Caesium',      mass:132.91,   family:'alkali',    state:'solid',  group:1, period:6, config:'[Xe] 6s¹',          melt:28, boil:671, discovered:1860, usos:'Relojes atómicos (define el segundo), células fotoeléctricas.', curio:'Define oficialmente el segundo: 9.192.631.770 oscilaciones del Cs-133.' },
  {z:56, sym:'Ba', name:'Bario',       nameEn:'Barium',       mass:137.33,   family:'alkaline',  state:'solid',  group:2, period:6, config:'[Xe] 6s²',          melt:727, boil:1897, discovered:1808, usos:'Fuegos artificiales verdes, radiografías, perforación de pozos.', curio:'El sulfato de bario se bebe antes de una radiografía gastrointestinal.' },
  {z:57, sym:'La', name:'Lantano',     nameEn:'Lanthanum',    mass:138.91,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 5d¹ 6s²',      melt:920, boil:3464, discovered:1839, usos:'Catalizadores, vidrios ópticos, baterías híbridas.', curio:'Da nombre a toda la serie de los lantánidos.' },
  {z:58, sym:'Ce', name:'Cerio',       nameEn:'Cerium',       mass:140.12,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹ 5d¹ 6s²',  melt:795, boil:3443, discovered:1803, usos:'Encendedores (piedras), catalizadores, pulido de vidrio.', curio:'Es el más abundante de las "tierras raras".' },
  {z:59, sym:'Pr', name:'Praseodimio', nameEn:'Praseodymium', mass:140.91,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f³ 6s²',      melt:935, boil:3520, discovered:1885, usos:'Imanes, vidrios para soldadura, láseres.', curio:'Su nombre significa "gemelo verde" por el color de sus sales.' },
  {z:60, sym:'Nd', name:'Neodimio',    nameEn:'Neodymium',    mass:144.24,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f⁴ 6s²',      melt:1024, boil:3074, discovered:1885, usos:'Imanes potentísimos (Nd-Fe-B), láseres, auriculares.', curio:'Los imanes de neodimio son los más fuertes comercialmente disponibles.' },
  {z:61, sym:'Pm', name:'Prometio',    nameEn:'Promethium',   mass:145,      family:'lanthanide', state:'synthetic', group:3, period:6, config:'[Xe] 4f⁵ 6s²',  melt:1042, boil:3000, discovered:1945, usos:'Pinturas luminosas, baterías nucleares miniatura.', curio:'Único lantánido que no se encuentra naturalmente en cantidades apreciables.' },
  {z:62, sym:'Sm', name:'Samario',     nameEn:'Samarium',     mass:150.36,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f⁶ 6s²',      melt:1072, boil:1794, discovered:1879, usos:'Imanes Sm-Co resistentes al calor, reactores nucleares.', curio:'Primer elemento nombrado por una persona (V. E. Samarsky-Bykhovets).' },
  {z:63, sym:'Eu', name:'Europio',     nameEn:'Europium',     mass:151.96,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f⁷ 6s²',      melt:822, boil:1529, discovered:1901, usos:'Pantallas (rojo y azul), fósforos fluorescentes, antifalsificación de euros.', curio:'Los billetes de euro contienen europio que brilla bajo luz UV.' },
  {z:64, sym:'Gd', name:'Gadolinio',   nameEn:'Gadolinium',   mass:157.25,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f⁷ 5d¹ 6s²',  melt:1313, boil:3273, discovered:1880, usos:'Contraste en resonancia magnética, absorbedor de neutrones.', curio:'Tiene la mayor capacidad de captura de neutrones de todos los elementos estables.' },
  {z:65, sym:'Tb', name:'Terbio',      nameEn:'Terbium',      mass:158.93,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f⁹ 6s²',      melt:1356, boil:3230, discovered:1843, usos:'Pantallas verdes, láseres, sonar.', curio:'Otro elemento nombrado por Ytterby (Suecia).' },
  {z:66, sym:'Dy', name:'Disprosio',   nameEn:'Dysprosium',   mass:162.50,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹⁰ 6s²',     melt:1412, boil:2567, discovered:1886, usos:'Imanes de alta temperatura, láseres, reactores nucleares.', curio:'Su nombre significa "difícil de obtener" en griego.' },
  {z:67, sym:'Ho', name:'Holmio',      nameEn:'Holmium',      mass:164.93,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹¹ 6s²',     melt:1474, boil:2700, discovered:1878, usos:'Láseres médicos (urología), espectrómetros.', curio:'Tiene la mayor fuerza magnética de cualquier elemento.' },
  {z:68, sym:'Er', name:'Erbio',       nameEn:'Erbium',       mass:167.26,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹² 6s²',     melt:1529, boil:2868, discovered:1843, usos:'Amplificadores de fibra óptica, gafas de visión nocturna.', curio:'Hace que internet funcione: amplifica señales en fibras submarinas.' },
  {z:69, sym:'Tm', name:'Tulio',       nameEn:'Thulium',      mass:168.93,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹³ 6s²',     melt:1545, boil:1950, discovered:1879, usos:'Láseres portátiles de rayos X, iluminación.', curio:'Uno de los elementos naturales más raros y caros.' },
  {z:70, sym:'Yb', name:'Iterbio',     nameEn:'Ytterbium',    mass:173.05,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹⁴ 6s²',     melt:819, boil:1196, discovered:1878, usos:'Relojes atómicos ultrapprecisos, láseres.', curio:'Los relojes atómicos de iterbio son los más precisos jamás construidos.' },
  {z:71, sym:'Lu', name:'Lutecio',     nameEn:'Lutetium',     mass:174.97,   family:'lanthanide', state:'solid', group:3, period:6, config:'[Xe] 4f¹⁴ 5d¹ 6s²', melt:1663, boil:3402, discovered:1907, usos:'Catalizadores petroquímicos, tomografía PET.', curio:'Nombrado por Lutetia, el nombre romano de París.' },
  {z:72, sym:'Hf', name:'Hafnio',      nameEn:'Hafnium',      mass:178.49,   family:'transition',state:'solid',  group:4, period:6, config:'[Xe] 4f¹⁴ 5d² 6s²', melt:2233, boil:4603, discovered:1923, usos:'Reactores nucleares, procesadores de alta densidad (chips).', curio:'Casi idéntico al zirconio; tardó un siglo en distinguirse.' },
  {z:73, sym:'Ta', name:'Tántalo',     nameEn:'Tantalum',     mass:180.95,   family:'transition',state:'solid',  group:5, period:6, config:'[Xe] 4f¹⁴ 5d³ 6s²', melt:3017, boil:5458, discovered:1802, usos:'Condensadores (móviles), instrumentos quirúrgicos, aeronáutica.', curio:'Su mineral coltán, en África, alimenta la industria de smartphones.' },
  {z:74, sym:'W',  name:'Wolframio',   nameEn:'Tungsten',     mass:183.84,   family:'transition',state:'solid',  group:6, period:6, config:'[Xe] 4f¹⁴ 5d⁴ 6s²', melt:3422, boil:5555, discovered:1783, usos:'Filamentos de bombillas, perforación, municiones.', curio:'Tiene el punto de fusión más alto de todos los metales puros (3422°C).' },
  {z:75, sym:'Re', name:'Renio',       nameEn:'Rhenium',      mass:186.21,   family:'transition',state:'solid',  group:7, period:6, config:'[Xe] 4f¹⁴ 5d⁵ 6s²', melt:3186, boil:5596, discovered:1925, usos:'Aleaciones para turbinas de jets, catalizadores.', curio:'El último elemento natural estable descubierto.' },
  {z:76, sym:'Os', name:'Osmio',       nameEn:'Osmium',       mass:190.23,   family:'transition',state:'solid',  group:8, period:6, config:'[Xe] 4f¹⁴ 5d⁶ 6s²', melt:3033, boil:5012, discovered:1803, usos:'Puntas de plumas, contactos eléctricos, aleaciones duras.', curio:'Es el elemento más denso (22.59 g/cm³): un litro pesa casi 23 kg.' },
  {z:77, sym:'Ir', name:'Iridio',      nameEn:'Iridium',      mass:192.22,   family:'transition',state:'solid',  group:9, period:6, config:'[Xe] 4f¹⁴ 5d⁷ 6s²', melt:2446, boil:4428, discovered:1803, usos:'Bujías, crisoles, aleaciones ultrarresistentes.', curio:'Abundante en meteoritos; capa de iridio marca la extinción de los dinosaurios.' },
  {z:78, sym:'Pt', name:'Platino',     nameEn:'Platinum',     mass:195.08,   family:'transition',state:'solid',  group:10,period:6, config:'[Xe] 4f¹⁴ 5d⁹ 6s¹', melt:1768, boil:3825, discovered:1735, usos:'Joyería, catalizadores de auto, electrodos, medicina.', curio:'El kilogramo patrón (1889–2019) era una aleación platino-iridio.' },
  {z:79, sym:'Au', name:'Oro',         nameEn:'Gold',         mass:196.97,   family:'transition',state:'solid',  group:11,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s¹', melt:1064, boil:2856, discovered:-4000, usos:'Joyería, electrónica, reserva financiera, medicina.', curio:'No se oxida ni se corroe; muchas piezas de faraones siguen intactas.' },
  {z:80, sym:'Hg', name:'Mercurio',    nameEn:'Mercury',      mass:200.59,   family:'transition',state:'liquid', group:12,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s²', melt:-39, boil:357, discovered:-1500, usos:'Termómetros (prohibidos), amalgamas dentales, lámparas UV.', curio:'Único metal líquido a temperatura ambiente; los romanos lo llamaron "plata viva".' },
  {z:81, sym:'Tl', name:'Talio',       nameEn:'Thallium',     mass:204.38,   family:'postTransition', state:'solid', group:13,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', melt:304, boil:1473, discovered:1861, usos:'Electrónica (vidrios ópticos), veneno (prohibido), medicina.', curio:'Conocido como "el veneno del envenenador" por ser indetectable y fatal.' },
  {z:82, sym:'Pb', name:'Plomo',       nameEn:'Lead',         mass:207.2,    family:'postTransition', state:'solid', group:14,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', melt:327, boil:1749, discovered:-7000, usos:'Baterías de auto, protección radiológica, soldaduras.', curio:'Se cree que contribuyó a la caída del Imperio Romano por su uso en tuberías.' },
  {z:83, sym:'Bi', name:'Bismuto',     nameEn:'Bismuth',      mass:208.98,   family:'postTransition', state:'solid', group:15,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', melt:271, boil:1564, discovered:1753, usos:'Cosméticos, medicamentos (Pepto-Bismol), aleaciones.', curio:'Forma cristales escalonados con coloridos tornasolados espectaculares.' },
  {z:84, sym:'Po', name:'Polonio',     nameEn:'Polonium',     mass:209,      family:'postTransition', state:'solid', group:16,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', melt:254, boil:962, discovered:1898, usos:'Fuentes de neutrones, eliminación de estática (obsoleto).', curio:'Descubierto por Marie Curie; nombrado en honor a Polonia, su patria.' },
  {z:85, sym:'At', name:'Astato',      nameEn:'Astatine',     mass:210,      family:'halogen',   state:'solid',  group:17,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', melt:302, boil:337, discovered:1940, usos:'Investigación (terapia radiológica experimental).', curio:'El elemento natural más raro: apenas 25 g en toda la corteza terrestre.' },
  {z:86, sym:'Rn', name:'Radón',       nameEn:'Radon',        mass:222,      family:'noble',     state:'gas',    group:18,period:6, config:'[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', melt:-71, boil:-62, discovered:1899, usos:'Investigación (tratamientos médicos en el pasado).', curio:'Gas radiactivo; segunda causa de cáncer de pulmón tras el tabaco.' },
  {z:87, sym:'Fr', name:'Francio',     nameEn:'Francium',     mass:223,      family:'alkali',    state:'solid',  group:1, period:7, config:'[Rn] 7s¹',              melt:27, boil:677, discovered:1939, usos:'Investigación (muestras microscópicas).', curio:'Hay menos de 30 g en toda la corteza terrestre en cualquier momento.' },
  {z:88, sym:'Ra', name:'Radio',       nameEn:'Radium',       mass:226,      family:'alkaline',  state:'solid',  group:2, period:7, config:'[Rn] 7s²',              melt:700, boil:1737, discovered:1898, usos:'Investigación; antiguamente en pinturas luminosas.', curio:'Descubierto por Marie y Pierre Curie; brilla con luz azul en la oscuridad.' },
  {z:89, sym:'Ac', name:'Actinio',     nameEn:'Actinium',     mass:227,      family:'actinide',  state:'solid',  group:3, period:7, config:'[Rn] 6d¹ 7s²',          melt:1050, boil:3200, discovered:1899, usos:'Fuentes de neutrones, radioterapia dirigida.', curio:'Da nombre a toda la serie de los actínidos.' },
  {z:90, sym:'Th', name:'Torio',       nameEn:'Thorium',      mass:232.04,   family:'actinide',  state:'solid',  group:3, period:7, config:'[Rn] 6d² 7s²',          melt:1750, boil:4788, discovered:1829, usos:'Combustible nuclear alternativo, aleaciones.', curio:'Reactores de torio: más seguros y menos residuos que los de uranio.' },
  {z:91, sym:'Pa', name:'Protactinio', nameEn:'Protactinium', mass:231.04,   family:'actinide',  state:'solid',  group:3, period:7, config:'[Rn] 5f² 6d¹ 7s²',      melt:1572, boil:4027, discovered:1913, usos:'Investigación (datación geológica).', curio:'Uno de los elementos naturales más caros: ~280.000 USD por gramo.' },
  {z:92, sym:'U',  name:'Uranio',      nameEn:'Uranium',      mass:238.03,   family:'actinide',  state:'solid',  group:3, period:7, config:'[Rn] 5f³ 6d¹ 7s²',      melt:1135, boil:4131, discovered:1789, usos:'Combustible nuclear, armas nucleares, datación.', curio:'Elemento natural más pesado de la Tierra; núcleo inestable.' },
  {z:93, sym:'Np', name:'Neptunio',    nameEn:'Neptunium',    mass:237,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f⁴ 6d¹ 7s²', melt:644, boil:3902, discovered:1940, usos:'Detectores de neutrones, investigación.', curio:'Primer elemento transuránico descubierto (más pesado que el U).' },
  {z:94, sym:'Pu', name:'Plutonio',    nameEn:'Plutonium',    mass:244,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f⁶ 7s²',      melt:640, boil:3228, discovered:1940, usos:'Armas nucleares, baterías de sondas espaciales (RTG).', curio:'Alimentó a las Voyager, Cassini y al rover Curiosity en Marte.' },
  {z:95, sym:'Am', name:'Americio',    nameEn:'Americium',    mass:243,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f⁷ 7s²',      melt:1176, boil:2011, discovered:1944, usos:'Detectores de humo domésticos, fuentes de neutrones.', curio:'Probablemente tienes americio en casa: en los detectores de humo.' },
  {z:96, sym:'Cm', name:'Curio',       nameEn:'Curium',       mass:247,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f⁷ 6d¹ 7s²', melt:1345, boil:3100, discovered:1944, usos:'Fuentes de energía en satélites, investigación.', curio:'Nombrado por Marie y Pierre Curie.' },
  {z:97, sym:'Bk', name:'Berkelio',    nameEn:'Berkelium',    mass:247,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f⁹ 7s²',      melt:986, boil:2627, discovered:1949, usos:'Investigación (síntesis de elementos superpesados).', curio:'Nombrado por Berkeley, Universidad donde se sintetizó.' },
  {z:98, sym:'Cf', name:'Californio',  nameEn:'Californium',  mass:251,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f¹⁰ 7s²',     melt:900, boil:1470, discovered:1950, usos:'Fuentes de neutrones industriales, medicina.', curio:'Un gramo cuesta más de 25 millones de dólares.' },
  {z:99, sym:'Es', name:'Einstenio',   nameEn:'Einsteinium',  mass:252,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f¹¹ 7s²',     melt:860, boil:996, discovered:1952, usos:'Investigación únicamente.', curio:'Descubierto en los restos de la primera bomba de hidrógeno (1952).' },
  {z:100,sym:'Fm', name:'Fermio',      nameEn:'Fermium',      mass:257,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f¹² 7s²',     melt:1527, boil:0, discovered:1952, usos:'Investigación únicamente.', curio:'Nombrado por Enrico Fermi; último elemento producido por fisión.' },
  {z:101,sym:'Md', name:'Mendelevio',  nameEn:'Mendelevium',  mass:258,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f¹³ 7s²',     melt:827, boil:0, discovered:1955, usos:'Investigación únicamente.', curio:'Nombrado por Dmitri Mendeléyev, creador de la tabla periódica.' },
  {z:102,sym:'No', name:'Nobelio',     nameEn:'Nobelium',     mass:259,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f¹⁴ 7s²',     melt:827, boil:0, discovered:1958, usos:'Investigación únicamente.', curio:'Nombrado por Alfred Nobel, creador de los Premios Nobel.' },
  {z:103,sym:'Lr', name:'Laurencio',   nameEn:'Lawrencium',   mass:266,      family:'actinide',  state:'synthetic', group:3, period:7, config:'[Rn] 5f¹⁴ 7s² 7p¹', melt:1627, boil:0, discovered:1961, usos:'Investigación únicamente.', curio:'Nombrado por E. O. Lawrence, inventor del ciclotrón.' },
  {z:104,sym:'Rf', name:'Rutherfordio',nameEn:'Rutherfordium',mass:267,      family:'transition',state:'synthetic', group:4, period:7, config:'[Rn] 5f¹⁴ 6d² 7s²', melt:2100, boil:5500, discovered:1964, usos:'Investigación únicamente.', curio:'Primer elemento "transactínido" (más allá de los actínidos).' },
  {z:105,sym:'Db', name:'Dubnio',      nameEn:'Dubnium',      mass:268,      family:'transition',state:'synthetic', group:5, period:7, config:'[Rn] 5f¹⁴ 6d³ 7s²', melt:0, boil:0, discovered:1968, usos:'Investigación únicamente.', curio:'Nombrado por Dubna, ciudad rusa famosa por física nuclear.' },
  {z:106,sym:'Sg', name:'Seaborgio',   nameEn:'Seaborgium',   mass:269,      family:'transition',state:'synthetic', group:6, period:7, config:'[Rn] 5f¹⁴ 6d⁴ 7s²', melt:0, boil:0, discovered:1974, usos:'Investigación únicamente.', curio:'Primer elemento nombrado en vida de la persona honrada (Glenn Seaborg).' },
  {z:107,sym:'Bh', name:'Bohrio',      nameEn:'Bohrium',      mass:270,      family:'transition',state:'synthetic', group:7, period:7, config:'[Rn] 5f¹⁴ 6d⁵ 7s²', melt:0, boil:0, discovered:1981, usos:'Investigación únicamente.', curio:'Nombrado por Niels Bohr, creador del modelo atómico.' },
  {z:108,sym:'Hs', name:'Hasio',       nameEn:'Hassium',      mass:269,      family:'transition',state:'synthetic', group:8, period:7, config:'[Rn] 5f¹⁴ 6d⁶ 7s²', melt:0, boil:0, discovered:1984, usos:'Investigación únicamente.', curio:'Nombrado por Hassia, nombre latino del estado alemán de Hesse.' },
  {z:109,sym:'Mt', name:'Meitnerio',   nameEn:'Meitnerium',   mass:278,      family:'transition',state:'synthetic', group:9, period:7, config:'[Rn] 5f¹⁴ 6d⁷ 7s²', melt:0, boil:0, discovered:1982, usos:'Investigación únicamente.', curio:'Nombrado por Lise Meitner, codescubridora de la fisión nuclear.' },
  {z:110,sym:'Ds', name:'Darmstadtio', nameEn:'Darmstadtium', mass:281,      family:'transition',state:'synthetic', group:10,period:7, config:'[Rn] 5f¹⁴ 6d⁸ 7s²', melt:0, boil:0, discovered:1994, usos:'Investigación únicamente.', curio:'Nombrado por Darmstadt, ciudad alemana donde fue sintetizado.' },
  {z:111,sym:'Rg', name:'Roentgenio',  nameEn:'Roentgenium',  mass:282,      family:'transition',state:'synthetic', group:11,period:7, config:'[Rn] 5f¹⁴ 6d⁹ 7s²', melt:0, boil:0, discovered:1994, usos:'Investigación únicamente.', curio:'Nombrado por Wilhelm Röntgen, descubridor de los rayos X.' },
  {z:112,sym:'Cn', name:'Copernicio',  nameEn:'Copernicium',  mass:285,      family:'transition',state:'synthetic', group:12,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s²', melt:0, boil:0, discovered:1996, usos:'Investigación únicamente.', curio:'Nombrado por Nicolás Copérnico, astrónomo polaco.' },
  {z:113,sym:'Nh', name:'Nihonio',     nameEn:'Nihonium',     mass:286,      family:'postTransition', state:'synthetic', group:13,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', melt:430, boil:1130, discovered:2004, usos:'Investigación únicamente.', curio:'Primer elemento descubierto en Asia; "Nihon" significa Japón.' },
  {z:114,sym:'Fl', name:'Flerovio',    nameEn:'Flerovium',    mass:289,      family:'postTransition', state:'synthetic', group:14,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', melt:0, boil:0, discovered:1998, usos:'Investigación únicamente.', curio:'Nombrado por Georgy Flerov, físico soviético.' },
  {z:115,sym:'Mc', name:'Moscovio',    nameEn:'Moscovium',    mass:290,      family:'postTransition', state:'synthetic', group:15,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', melt:670, boil:1400, discovered:2003, usos:'Investigación únicamente.', curio:'Nombrado por Moscú, centro de sus descubridores rusos.' },
  {z:116,sym:'Lv', name:'Livermorio',  nameEn:'Livermorium',  mass:293,      family:'postTransition', state:'synthetic', group:16,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', melt:710, boil:1085, discovered:2000, usos:'Investigación únicamente.', curio:'Nombrado por el Lawrence Livermore National Laboratory.' },
  {z:117,sym:'Ts', name:'Tenesino',    nameEn:'Tennessine',   mass:294,      family:'halogen',   state:'synthetic', group:17,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', melt:0, boil:0, discovered:2010, usos:'Investigación únicamente.', curio:'Nombrado por el estado de Tennessee (EE.UU.), solo se han creado pocos átomos.' },
  {z:118,sym:'Og', name:'Oganesón',    nameEn:'Oganesson',    mass:294,      family:'noble',     state:'synthetic', group:18,period:7, config:'[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', melt:0, boil:80, discovered:2002, usos:'Investigación únicamente.', curio:'Elemento más pesado conocido; segundo nombrado en vida del honrado (Yuri Oganessian).' },
];

// Posición especial para lantánidos y actínidos (filas separadas)
ELEMENTS.forEach(e => {
  if(e.family === 'lanthanide'){
    e.displayPeriod = 9;
    e.displayGroup = e.z - 57 + 3; // 3..17
  } else if(e.family === 'actinide'){
    e.displayPeriod = 10;
    e.displayGroup = e.z - 89 + 3; // 3..17
  } else {
    e.displayPeriod = e.period;
    e.displayGroup = e.group;
  }
});

// Familias con color y nombre en español
const FAMILIES = {
  alkali:         { name: 'Alcalinos',            color: 0xff4a82, css: '#ff4a82' },
  alkaline:       { name: 'Alcalinotérreos',      color: 0xff7a3d, css: '#ff7a3d' },
  transition:     { name: 'Metales de transición',color: 0xf5c84b, css: '#f5c84b' },
  postTransition: { name: 'Post-transición',      color: 0x8ee06b, css: '#8ee06b' },
  metalloid:      { name: 'Metaloides',           color: 0x4ee0b8, css: '#4ee0b8' },
  nonmetal:       { name: 'No metales',           color: 0x5fdcd4, css: '#5fdcd4' },
  halogen:        { name: 'Halógenos',            color: 0x5aa8ff, css: '#5aa8ff' },
  noble:          { name: 'Gases nobles',         color: 0xb47aff, css: '#b47aff' },
  lanthanide:     { name: 'Lantánidos',           color: 0xe85ad1, css: '#e85ad1' },
  actinide:       { name: 'Actínidos',            color: 0xff6aae, css: '#ff6aae' },
  unknown:        { name: 'Desconocido',          color: 0x8a9aa8, css: '#8a9aa8' },
};

const STATES_ES = { solid:'Sólido', liquid:'Líquido', gas:'Gas', synthetic:'Sintético' };

// =========================================================
// ESTADO DE LA APLICACIÓN
// =========================================================
const appState = {
  scene: null,
  camera: null,
  renderer: null,
  labelRenderer: null,
  controls: null,
  composer: null,
  elementMeshes: [],         // Array de { mesh, data, basePosition, targetPosition, label }
  raycaster: new THREE.Raycaster(),
  pointer: new THREE.Vector2(-10, -10),
  selected: null,
  hovered: null,
  viewMode: 'table',         // 'table' | 'sphere' | 'helix'
  activeFamily: null,        // null = todas
  activeStates: new Set(),   // filtros acumulables
  searchQuery: '',
  compareMode: false,
  compareList: [],
  quizActive: false,
  quizIndex: 0,
  quizScore: 0,
  quizData: [],
  animating: false,
};

// Exponer para debug si se desea
window.EDU = appState;

// Continúa en la siguiente parte...

// =========================================================
// INICIALIZACIÓN DE LA ESCENA 3D
// =========================================================
function initScene(){
  const canvas = document.getElementById('canvas3d');

  // Scene
  appState.scene = new THREE.Scene();
  appState.scene.background = new THREE.Color(0x030b12);
  appState.scene.fog = new THREE.Fog(0x030b12, 800, 2200);

  // Camera
  appState.camera = new THREE.PerspectiveCamera(
    55, window.innerWidth/window.innerHeight, 1, 4000
  );
  appState.camera.position.set(0, 0, 1400);

  // Renderer
  appState.renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
  });
  appState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  appState.renderer.setSize(window.innerWidth, window.innerHeight);
  appState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  appState.renderer.toneMappingExposure = 1.1;

  // Label Renderer (para etiquetas HTML sobre elementos)
  appState.labelRenderer = new CSS2DRenderer();
  appState.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  appState.labelRenderer.domElement.style.position = 'fixed';
  appState.labelRenderer.domElement.style.top = '0';
  appState.labelRenderer.domElement.style.pointerEvents = 'none';
  appState.labelRenderer.domElement.style.zIndex = '5';
  document.body.appendChild(appState.labelRenderer.domElement);

  // Controls
  appState.controls = new OrbitControls(appState.camera, appState.renderer.domElement);
  appState.controls.enableDamping = true;
  appState.controls.dampingFactor = 0.08;
  appState.controls.rotateSpeed = 0.55;
  appState.controls.zoomSpeed = 0.8;
  appState.controls.minDistance = 120;
  appState.controls.maxDistance = 2500;
  appState.controls.enablePan = true;
  appState.controls.panSpeed = 0.5;

  // Luces
  const ambient = new THREE.AmbientLight(0x334a5a, 0.85);
  appState.scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0x88e0ff, 0.7);
  keyLight.position.set(400, 500, 600);
  appState.scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xff5a8a, 0.35);
  rimLight.position.set(-500, -200, -400);
  appState.scene.add(rimLight);

  const fillLight = new THREE.PointLight(0x5fdcd4, 0.4, 2000);
  fillLight.position.set(0, 0, 800);
  appState.scene.add(fillLight);

  // Post-processing bloom (sutil, para no matar rendimiento)
  const renderScene = new RenderPass(appState.scene, appState.camera);
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55,  // strength
    0.4,   // radius
    0.85   // threshold
  );
  appState.composer = new EffectComposer(appState.renderer);
  appState.composer.addPass(renderScene);
  appState.composer.addPass(bloom);

  // Fondo: estrellas
  createStarfield();

  // Grid holográfico piso
  createHoloFloor();
}

function createStarfield(){
  const starCount = 800;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for(let i = 0; i < starCount; i++){
    const r = 1500 + Math.random() * 1500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2*Math.random() - 1);
    positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = r * Math.cos(phi);

    const t = Math.random();
    if(t > 0.9){ // rosado
      colors[i*3] = 0.95; colors[i*3+1] = 0.4; colors[i*3+2] = 0.55;
    } else if(t > 0.6){ // turquesa
      colors[i*3] = 0.37; colors[i*3+1] = 0.86; colors[i*3+2] = 0.83;
    } else { // blanco suave
      colors[i*3] = 0.9; colors[i*3+1] = 0.92; colors[i*3+2] = 0.95;
    }
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 2.2, vertexColors: true, transparent: true, opacity: 0.8,
    sizeAttenuation: true, depthWrite: false
  });
  appState.scene.add(new THREE.Points(geom, mat));
}

function createHoloFloor(){
  const size = 3000, div = 40;
  const grid = new THREE.GridHelper(size, div, 0x2fa9a3, 0x0D2E3E);
  grid.position.y = -400;
  grid.material.opacity = 0.15;
  grid.material.transparent = true;
  grid.material.depthWrite = false;
  appState.scene.add(grid);
}

// =========================================================
// CONSTRUCCIÓN DE LOS TILES DE CADA ELEMENTO
// =========================================================
const TILE_W = 78, TILE_H = 90, GAP = 6;

function buildElements(){
  const group = new THREE.Group();
  group.name = 'elements';

  // Textura con símbolo (canvas2D → CanvasTexture)
  ELEMENTS.forEach(data => {
    const familyColor = FAMILIES[data.family].color;

    // Geometría del tile (caja plana con profundidad)
    const geo = new THREE.BoxGeometry(TILE_W, TILE_H, 6, 1, 1, 1);

    // Crear textura frontal con canvas
    const texture = createElementTexture(data, familyColor);

    // Material semi-transparente tipo holograma
    const materials = [
      new THREE.MeshPhongMaterial({ color: familyColor, opacity: 0.35, transparent: true, shininess: 100 }), // right
      new THREE.MeshPhongMaterial({ color: familyColor, opacity: 0.35, transparent: true, shininess: 100 }), // left
      new THREE.MeshPhongMaterial({ color: familyColor, opacity: 0.35, transparent: true, shininess: 100 }), // top
      new THREE.MeshPhongMaterial({ color: familyColor, opacity: 0.35, transparent: true, shininess: 100 }), // bottom
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95 }),                         // FRONT
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.4 }),                          // back
    ];

    const mesh = new THREE.Mesh(geo, materials);
    mesh.userData.element = data;
    mesh.userData.baseColor = familyColor;

    // Posición inicial (tabla)
    const pos = computeTablePosition(data);
    mesh.position.copy(pos);

    // Pequeño halo: ring detrás
    const haloGeo = new THREE.RingGeometry(58, 64, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: familyColor, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.z = -4;
    mesh.add(halo);
    mesh.userData.halo = halo;

    group.add(mesh);

    appState.elementMeshes.push({
      mesh, data,
      basePosition: pos.clone(),
      targetPosition: pos.clone(),
    });
  });

  appState.scene.add(group);
}

function computeTablePosition(e){
  // Centro la tabla en el origen
  const cols = 18, rows = 10; // 7 filas principales + 2 de lan/act + gap
  const totalW = cols * (TILE_W + GAP);
  const totalH = rows * (TILE_H + GAP);
  const x = (e.displayGroup - 1) * (TILE_W + GAP) - totalW/2 + (TILE_W + GAP)/2;
  // Filas: periodo 1..7 arriba, luego gap, luego 9 y 10
  let rowIdx = e.displayPeriod;
  if(rowIdx >= 9) rowIdx += 0.5; // pequeño separador visual
  const y = -((rowIdx - 1) * (TILE_H + GAP) - totalH/2 + (TILE_H + GAP)/2);
  return new THREE.Vector3(x, y, 0);
}

function createElementTexture(data, familyColor){
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = Math.round(size * TILE_H / TILE_W);
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Fondo gradiente
  const c = '#' + familyColor.toString(16).padStart(6,'0');
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, shade(c, -50));
  grad.addColorStop(0.5, shade(c, -70));
  grad.addColorStop(1, '#051520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Borde superior (línea de acento)
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(w-8, 4); ctx.stroke();

  // Esquinas decorativas
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  const corner = 14;
  [[10,10],[w-10,10],[10,h-10],[w-10,h-10]].forEach(([x,y],i) => {
    ctx.beginPath();
    if(i===0){ ctx.moveTo(x, y+corner); ctx.lineTo(x,y); ctx.lineTo(x+corner,y); }
    if(i===1){ ctx.moveTo(x-corner, y); ctx.lineTo(x,y); ctx.lineTo(x,y+corner); }
    if(i===2){ ctx.moveTo(x, y-corner); ctx.lineTo(x,y); ctx.lineTo(x+corner,y); }
    if(i===3){ ctx.moveTo(x-corner, y); ctx.lineTo(x,y); ctx.lineTo(x,y-corner); }
    ctx.stroke();
  });

  // Z (número atómico) arriba izquierda
  ctx.fillStyle = '#E1E4E7';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(data.z, 14, 34);

  // Masa arriba derecha
  ctx.fillStyle = 'rgba(225,228,231,0.6)';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(data.mass.toFixed(2), w-14, 30);

  // Símbolo (grande, centro)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 82px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = c;
  ctx.shadowBlur = 20;
  ctx.fillText(data.sym, w/2, h/2 + 20);
  ctx.shadowBlur = 0;

  // Nombre abajo
  ctx.fillStyle = '#E1E4E7';
  ctx.font = '500 16px "Exo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.name, w/2, h - 18);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function shade(hex, amount){
  let c = hex.replace('#','');
  let r = parseInt(c.substring(0,2),16);
  let g = parseInt(c.substring(2,4),16);
  let b = parseInt(c.substring(4,6),16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}

// =========================================================
// MODOS DE VISUALIZACIÓN (TABLA, ESFERA, HÉLICE)
// =========================================================
function computeLayoutPositions(mode){
  const positions = {};
  const n = ELEMENTS.length;

  ELEMENTS.forEach((e, i) => {
    let pos;
    if(mode === 'table'){
      pos = computeTablePosition(e);
    }
    else if(mode === 'sphere'){
      const phi = Math.acos(-1 + (2 * i) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      const R = 700;
      pos = new THREE.Vector3(
        R * Math.cos(theta) * Math.sin(phi),
        R * Math.sin(theta) * Math.sin(phi),
        R * Math.cos(phi)
      );
    }
    else if(mode === 'helix'){
      const angle = (i / n) * Math.PI * 8;
      const R = 600;
      pos = new THREE.Vector3(
        R * Math.sin(angle),
        -(i - n/2) * 14,
        R * Math.cos(angle)
      );
    }
    positions[e.z] = pos;
  });
  return positions;
}

function transitionTo(mode){
  if(appState.animating) return;
  appState.animating = true;
  appState.viewMode = mode;

  const positions = computeLayoutPositions(mode);
  const duration = 1300;
  const startTime = performance.now();

  // Guardar posiciones iniciales y objetivo
  appState.elementMeshes.forEach(em => {
    em.startPos = em.mesh.position.clone();
    em.endPos = positions[em.data.z];
    em.startRot = em.mesh.rotation.clone();
    em.endRot = new THREE.Euler(0,0,0);
    if(mode === 'sphere' || mode === 'helix'){
      // Mirar hacia el centro para que se vean desde la cámara
      const lookAt = new THREE.Vector3(0,0,0);
      const tempObj = new THREE.Object3D();
      tempObj.position.copy(em.endPos);
      tempObj.lookAt(lookAt);
      em.endRot = tempObj.rotation.clone();
    }
  });

  function animate(){
    const t = Math.min(1, (performance.now() - startTime) / duration);
    const eased = easeInOutCubic(t);
    appState.elementMeshes.forEach(em => {
      em.mesh.position.lerpVectors(em.startPos, em.endPos, eased);
      em.mesh.rotation.x = em.startRot.x + (em.endRot.x - em.startRot.x) * eased;
      em.mesh.rotation.y = em.startRot.y + (em.endRot.y - em.startRot.y) * eased;
      em.mesh.rotation.z = em.startRot.z + (em.endRot.z - em.startRot.z) * eased;
    });
    if(t < 1) requestAnimationFrame(animate);
    else {
      appState.animating = false;
      appState.elementMeshes.forEach(em => { em.basePosition = em.endPos.clone(); });
    }
  }
  animate();
}

function easeInOutCubic(t){
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

// =========================================================
// INTERACCIÓN: HOVER, CLICK
// =========================================================
function onPointerMove(ev){
  const rect = appState.renderer.domElement.getBoundingClientRect();
  appState.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  appState.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

  // Tooltip position
  const tooltip = document.getElementById('hoverTooltip');
  tooltip.style.left = ev.clientX + 'px';
  tooltip.style.top = ev.clientY + 'px';
}

function onPointerDown(ev){
  if(ev.target !== appState.renderer.domElement) return;
  appState.mouseDown = { x: ev.clientX, y: ev.clientY, t: performance.now() };
}

function onPointerUp(ev){
  if(!appState.mouseDown) return;
  const dx = Math.abs(ev.clientX - appState.mouseDown.x);
  const dy = Math.abs(ev.clientY - appState.mouseDown.y);
  const dt = performance.now() - appState.mouseDown.t;
  appState.mouseDown = null;

  // Solo considerar click si casi no hubo arrastre
  if(dx < 6 && dy < 6 && dt < 400){
    checkClick();
  }
}

function checkClick(){
  appState.raycaster.setFromCamera(appState.pointer, appState.camera);
  const meshes = appState.elementMeshes.map(em => em.mesh);
  const hits = appState.raycaster.intersectObjects(meshes, false);
  if(hits.length){
    const mesh = hits[0].object;
    const data = mesh.userData.element;
    selectElement(data);
  }
}

function updateHover(){
  appState.raycaster.setFromCamera(appState.pointer, appState.camera);
  const meshes = appState.elementMeshes.map(em => em.mesh);
  const hits = appState.raycaster.intersectObjects(meshes, false);

  const tooltip = document.getElementById('hoverTooltip');
  if(hits.length){
    const mesh = hits[0].object;
    const data = mesh.userData.element;

    if(appState.hovered !== mesh){
      // Salir del anterior
      if(appState.hovered){
        appState.hovered.userData.halo.material.opacity = 0;
      }
      appState.hovered = mesh;
      mesh.userData.halo.material.opacity = 0.7;
      tooltip.classList.add('visible');
      document.getElementById('tooltipSym').textContent = data.sym;
      document.getElementById('tooltipName').textContent = data.name;
      document.body.style.cursor = 'pointer';
    }
  } else if(appState.hovered){
    appState.hovered.userData.halo.material.opacity = 0;
    appState.hovered = null;
    tooltip.classList.remove('visible');
    document.body.style.cursor = 'default';
  }
}

// =========================================================
// SELECCIÓN Y PANEL DE DETALLES
// =========================================================
function selectElement(data){
  appState.selected = data;

  // Si en modo comparación, añadir a la lista
  if(appState.compareMode){
    addToCompare(data);
    return;
  }

  showDetailPanel(data);
  focusCameraOnElement(data);
}

function showDetailPanel(data){
  const panel = document.getElementById('detailPanel');
  const family = FAMILIES[data.family];

  document.getElementById('detailSymbol').textContent = data.sym;
  document.getElementById('detailSymbol').style.color = family.css;
  document.getElementById('detailName').textContent = data.name;
  document.getElementById('detailNameEn').textContent = data.nameEn;
  document.getElementById('detailAtomic').textContent = 'Z = ' + data.z;
  document.getElementById('detailFamily').textContent = family.name;
  document.getElementById('detailFamily').style.color = family.css;
  document.getElementById('detailHeader').style.color = family.css;

  // Configuración electrónica para el modelo de Bohr
  const shells = computeShells(data.z);
  const atomDiagram = buildAtomDiagram(data, family.css, shells);

  const stats = `
    <div class="stat-grid">
      <div class="stat">
        <div class="stat-label">Masa atómica</div>
        <div class="stat-value">${data.mass}<small>u</small></div>
      </div>
      <div class="stat">
        <div class="stat-label">Estado (25°C)</div>
        <div class="stat-value">${STATES_ES[data.state] || data.state}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Grupo · Periodo</div>
        <div class="stat-value">${data.group} · ${data.period}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Descubierto</div>
        <div class="stat-value">${formatYear(data.discovered)}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Punto de fusión</div>
        <div class="stat-value">${data.melt||'—'}<small>°C</small></div>
      </div>
      <div class="stat">
        <div class="stat-label">Punto de ebullición</div>
        <div class="stat-value">${data.boil||'—'}<small>°C</small></div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Configuración electrónica</div>
      <div class="detail-section-content mono">${data.config}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Modelo atómico (Bohr)</div>
      ${atomDiagram}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Aplicaciones</div>
      <div class="detail-section-content">${data.usos}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">¿Sabías que...?</div>
      <div class="detail-section-content" style="font-style:italic; color:rgba(225,228,231,0.75)">${data.curio}</div>
    </div>
  `;
  document.getElementById('detailBody').innerHTML = stats;

  panel.classList.add('visible');
}

function computeShells(z){
  // Shells K,L,M,N,O,P,Q con capacidades 2,8,18,32,32,18,8 (simplificado)
  const caps = [2,8,18,32,32,18,8];
  const shells = [];
  let rem = z;
  for(let i=0; i<caps.length && rem>0; i++){
    const e = Math.min(caps[i], rem);
    shells.push(e);
    rem -= e;
  }
  return shells;
}

function buildAtomDiagram(data, color, shells){
  let html = `<div class="atom-model" style="color:${color}">`;
  html += `<div class="atom-nucleus"></div>`;
  html += `<div class="atom-nucleus-label">${data.sym}</div>`;
  const maxR = 62;
  shells.forEach((count, si) => {
    const radius = 14 + (si+1) * (maxR - 14) / shells.length;
    html += `<div class="atom-shell" style="width:${radius*2}px; height:${radius*2}px"></div>`;
    // Órbitales con electrones
    html += `<div class="atom-shell-rot" style="animation-duration:${6 + si*2}s; animation-direction:${si%2?'reverse':'normal'}">`;
    for(let k=0; k<count; k++){
      const ang = (k / count) * 360;
      html += `<div class="atom-electron" style="transform: rotate(${ang}deg) translateY(-${radius}px) rotate(-${ang}deg)"></div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;
  return html;
}

function formatYear(y){
  if(!y) return '—';
  if(y < 0) return Math.abs(y) + ' a.C.';
  return y;
}

function hideDetailPanel(){
  document.getElementById('detailPanel').classList.remove('visible');
  appState.selected = null;
}

// =========================================================
// CÁMARA: ENFOCAR UN ELEMENTO
// =========================================================
function focusCameraOnElement(data){
  const em = appState.elementMeshes.find(x => x.data.z === data.z);
  if(!em) return;

  const target = em.mesh.position.clone();
  const camDir = new THREE.Vector3()
    .subVectors(appState.camera.position, appState.controls.target)
    .normalize();
  const distance = 350;
  const newCamPos = target.clone().add(camDir.multiplyScalar(distance));

  animateCamera(newCamPos, target, 900);
}

function resetCamera(){
  animateCamera(new THREE.Vector3(0, 0, 1400), new THREE.Vector3(0,0,0), 1000);
}

function animateCamera(toPos, toTarget, duration){
  const startPos = appState.camera.position.clone();
  const startTarget = appState.controls.target.clone();
  const startTime = performance.now();
  function step(){
    const t = Math.min(1, (performance.now() - startTime)/duration);
    const e = easeInOutCubic(t);
    appState.camera.position.lerpVectors(startPos, toPos, e);
    appState.controls.target.lerpVectors(startTarget, toTarget, e);
    appState.controls.update();
    if(t < 1) requestAnimationFrame(step);
  }
  step();
}

// =========================================================
// FILTROS (familia, estado, búsqueda)
// =========================================================
function applyFilters(){
  const q = appState.searchQuery.trim().toLowerCase();
  let visibleCount = 0;

  appState.elementMeshes.forEach(em => {
    const d = em.data;
    let visible = true;

    if(appState.activeFamily && d.family !== appState.activeFamily) visible = false;
    if(appState.activeStates.size > 0 && !appState.activeStates.has(d.state)) visible = false;

    if(q){
      const hay = d.name.toLowerCase().includes(q) ||
                  d.nameEn.toLowerCase().includes(q) ||
                  d.sym.toLowerCase() === q ||
                  d.sym.toLowerCase().startsWith(q) ||
                  String(d.z) === q;
      if(!hay) visible = false;
    }

    em.mesh.visible = visible;
    if(visible) visibleCount++;

    // Atenuar si hay filtros activos y este no coincide
    const hasFilters = appState.activeFamily || appState.activeStates.size || q;
    em.mesh.material.forEach((m,i) => {
      if(i === 4 || i === 5){ // front/back
        m.opacity = visible ? (i===4?0.95:0.4) : 0;
      } else {
        m.opacity = visible ? 0.35 : 0;
      }
    });
  });

  document.getElementById('elementCounter').innerHTML = `<b>${visibleCount}</b> / 118 elementos`;
}

// =========================================================
// MODO COMPARAR
// =========================================================
function toggleCompareMode(){
  appState.compareMode = !appState.compareMode;
  const bar = document.getElementById('compareBar');
  const btn = document.getElementById('compareBtn');
  if(appState.compareMode){
    bar.classList.add('visible');
    btn.style.borderColor = 'var(--edu-magenta)';
    btn.style.color = 'var(--edu-magenta)';
    appState.compareList = [];
    updateCompareSlots();
  } else {
    bar.classList.remove('visible');
    btn.style.borderColor = '';
    btn.style.color = '';
    appState.compareList = [];
  }
}

function addToCompare(data){
  if(appState.compareList.length >= 2){
    appState.compareList = [data];
  } else {
    if(!appState.compareList.find(e => e.z === data.z)){
      appState.compareList.push(data);
    }
  }
  updateCompareSlots();
}

function updateCompareSlots(){
  [0,1].forEach(i => {
    const slot = document.getElementById('compareSlot'+i);
    if(appState.compareList[i]){
      slot.textContent = appState.compareList[i].sym;
      slot.classList.add('filled');
    } else {
      slot.textContent = '?';
      slot.classList.remove('filled');
    }
  });
  document.getElementById('compareGoBtn').disabled = appState.compareList.length !== 2;
}

function openCompareAnalysis(){
  const [a, b] = appState.compareList;
  if(!a || !b) return;
  const famA = FAMILIES[a.family], famB = FAMILIES[b.family];
  const grid = document.getElementById('compareGrid');
  grid.innerHTML = [a,b].map((e,idx) => {
    const fam = idx===0?famA:famB;
    return `
      <div class="compare-card" style="color:${fam.css}">
        <div class="detail-topline">
          <span>${fam.name}</span>
          <span style="color:rgba(225,228,231,0.6)">Z = ${e.z}</span>
        </div>
        <h4>${e.sym}</h4>
        <div style="color:var(--edu-pearl); font-size:16px; margin-bottom:14px; font-family:var(--font-display)">${e.name}</div>
        <div class="compare-row"><span class="lbl">Masa atómica</span><span class="val">${e.mass} u</span></div>
        <div class="compare-row"><span class="lbl">Estado</span><span class="val">${STATES_ES[e.state]}</span></div>
        <div class="compare-row"><span class="lbl">Configuración</span><span class="val">${e.config}</span></div>
        <div class="compare-row"><span class="lbl">Fusión</span><span class="val">${e.melt||'—'} °C</span></div>
        <div class="compare-row"><span class="lbl">Ebullición</span><span class="val">${e.boil||'—'} °C</span></div>
        <div class="compare-row"><span class="lbl">Grupo · Periodo</span><span class="val">${e.group} · ${e.period}</span></div>
        <div class="compare-row"><span class="lbl">Descubierto</span><span class="val">${formatYear(e.discovered)}</span></div>
      </div>
    `;
  }).join('');
  document.getElementById('compareModal').classList.add('visible');
}

// =========================================================
// QUIZ EDUCATIVO
// =========================================================
function generateQuiz(){
  const pool = ELEMENTS.filter(e => e.z <= 86); // elementos naturales principales
  const questions = [];
  const used = new Set();
  const getRandom = () => {
    let el;
    do { el = pool[Math.floor(Math.random() * pool.length)]; }
    while(used.has(el.z));
    used.add(el.z);
    return el;
  };

  // 5 preguntas variadas
  for(let i=0; i<5; i++){
    const el = getRandom();
    const type = i % 3; // 3 tipos rotativos
    let q;
    if(type === 0){
      // Identificar símbolo -> nombre
      q = {
        question: `¿A qué elemento corresponde el símbolo «${el.sym}»?`,
        correct: el.name,
        options: shuffled([el.name, ...pickRandomNames(pool, 3, el.z)]).slice(0,4)
      };
    } else if(type === 1){
      // Identificar nombre -> símbolo
      q = {
        question: `¿Cuál es el símbolo químico del ${el.name.toLowerCase()}?`,
        correct: el.sym,
        options: shuffled([el.sym, ...pickRandomSyms(pool, 3, el.z)]).slice(0,4)
      };
    } else {
      // Z del elemento
      q = {
        question: `¿Cuál es el número atómico del ${el.name.toLowerCase()}?`,
        correct: String(el.z),
        options: shuffled([el.z, el.z-1, el.z+1, el.z+5]).filter(v => v>0).map(String).slice(0,4)
      };
    }
    questions.push(q);
  }
  appState.quizData = questions;
  appState.quizIndex = 0;
  appState.quizScore = 0;
}

function pickRandomNames(pool, n, excludeZ){
  const arr = [];
  while(arr.length < n){
    const e = pool[Math.floor(Math.random()*pool.length)];
    if(e.z !== excludeZ && !arr.includes(e.name)) arr.push(e.name);
  }
  return arr;
}
function pickRandomSyms(pool, n, excludeZ){
  const arr = [];
  while(arr.length < n){
    const e = pool[Math.floor(Math.random()*pool.length)];
    if(e.z !== excludeZ && !arr.includes(e.sym)) arr.push(e.sym);
  }
  return arr;
}
function shuffled(arr){
  const a = [...arr];
  for(let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function showQuiz(){
  generateQuiz();
  document.getElementById('quizOverlay').classList.add('visible');
  renderQuizQuestion();
}

function renderQuizQuestion(){
  const q = appState.quizData[appState.quizIndex];
  document.getElementById('quizProgress').textContent = `Pregunta ${appState.quizIndex+1} de ${appState.quizData.length}`;
  document.getElementById('quizQuestion').textContent = q.question;
  document.getElementById('quizScore').textContent = appState.quizScore;
  document.getElementById('quizFeedback').classList.remove('visible');
  document.getElementById('quizNextBtn').disabled = true;

  const opts = document.getElementById('quizOptions');
  const keys = ['A','B','C','D'];
  opts.innerHTML = q.options.map((o,i) => `
    <button class="quiz-option" data-val="${o}">
      <span class="quiz-option-key">${keys[i]}</span>
      <span>${o}</span>
    </button>
  `).join('');
  opts.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => answerQuiz(btn));
  });
}

function answerQuiz(btn){
  const val = btn.dataset.val;
  const q = appState.quizData[appState.quizIndex];
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach(o => {
    o.style.pointerEvents = 'none';
    if(o.dataset.val === q.correct) o.classList.add('correct');
  });
  const feedback = document.getElementById('quizFeedback');
  if(val === q.correct){
    appState.quizScore++;
    feedback.className = 'quiz-feedback ok visible';
    feedback.textContent = '✓ ¡Correcto! Muy bien.';
  } else {
    btn.classList.add('incorrect');
    feedback.className = 'quiz-feedback err visible';
    feedback.textContent = `✗ La respuesta correcta es: ${q.correct}`;
  }
  document.getElementById('quizScore').textContent = appState.quizScore;
  document.getElementById('quizNextBtn').disabled = false;

  if(appState.quizIndex === appState.quizData.length - 1){
    document.getElementById('quizNextBtn').textContent = 'Finalizar';
  }
}

function nextQuizQuestion(){
  if(appState.quizIndex < appState.quizData.length - 1){
    appState.quizIndex++;
    renderQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz(){
  const pct = (appState.quizScore / appState.quizData.length) * 100;
  const msg = pct >= 80 ? '¡Excelente!' : pct >= 60 ? 'Buen trabajo, sigue practicando.' : 'Revisa los elementos e intenta de nuevo.';
  document.getElementById('quizQuestion').textContent = msg;
  document.getElementById('quizOptions').innerHTML = `
    <div style="text-align:center; padding:20px 0;">
      <div style="font-family:var(--font-display); font-size:48px; color:var(--edu-teal-glow); font-weight:700">
        ${appState.quizScore}<span style="color:rgba(225,228,231,0.4); font-size:24px">/${appState.quizData.length}</span>
      </div>
      <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:2px; text-transform:uppercase; color:rgba(225,228,231,0.6); margin-top:4px">
        ${Math.round(pct)}% de aciertos
      </div>
    </div>
  `;
  document.getElementById('quizNextBtn').textContent = 'Nuevo intento';
  document.getElementById('quizNextBtn').disabled = false;
  document.getElementById('quizNextBtn').onclick = () => { generateQuiz(); renderQuizQuestion(); };
  document.getElementById('quizFeedback').classList.remove('visible');
}

// =========================================================
// EVENT BINDINGS
// =========================================================
function bindEvents(){
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);

  // Start button
  document.getElementById('startBtn').addEventListener('click', enterMain);

  // View modes
  document.querySelectorAll('.view-mode-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.view-mode-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      transitionTo(b.dataset.mode);
    });
  });

  // Family filters
  const famList = document.getElementById('familyList');
  Object.entries(FAMILIES).forEach(([key, f]) => {
    if(key === 'unknown') return;
    const count = ELEMENTS.filter(e => e.family === key).length;
    const b = document.createElement('button');
    b.className = 'family-chip';
    b.dataset.family = key;
    b.innerHTML = `<span class="family-dot" style="color:${f.css}; background:${f.css}"></span>
                   <span>${f.name}</span>
                   <span class="family-count">${count}</span>`;
    b.addEventListener('click', () => {
      if(appState.activeFamily === key){
        appState.activeFamily = null;
        b.classList.remove('active');
      } else {
        famList.querySelectorAll('.family-chip').forEach(x => x.classList.remove('active'));
        appState.activeFamily = key;
        b.classList.add('active');
      }
      applyFilters();
    });
    famList.appendChild(b);
  });

  // State filters
  document.querySelectorAll('.state-chip').forEach(b => {
    b.addEventListener('click', () => {
      const s = b.dataset.state;
      if(appState.activeStates.has(s)){
        appState.activeStates.delete(s);
        b.classList.remove('active');
      } else {
        appState.activeStates.add(s);
        b.classList.add('active');
      }
      applyFilters();
    });
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    appState.searchQuery = e.target.value;
    applyFilters();
    // Si solo queda un visible, lo enfocamos
    const visible = appState.elementMeshes.filter(em => em.mesh.visible);
    if(visible.length === 1 && appState.searchQuery.length >= 2){
      selectElement(visible[0].data);
    }
  });

  // Keyboard shortcut for search
  document.addEventListener('keydown', (e) => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
    if(e.key === 'Escape'){
      if(document.getElementById('compareModal').classList.contains('visible')){
        document.getElementById('compareModal').classList.remove('visible');
      } else if(document.getElementById('quizOverlay').classList.contains('visible')){
        document.getElementById('quizOverlay').classList.remove('visible');
      } else if(appState.selected){
        hideDetailPanel();
      }
    }
  });

  // Detail panel buttons
  document.getElementById('detailCloseBtn').addEventListener('click', hideDetailPanel);
  document.getElementById('focusBtn').addEventListener('click', () => {
    if(appState.selected) focusCameraOnElement(appState.selected);
  });
  document.getElementById('addCompareBtn').addEventListener('click', () => {
    if(!appState.compareMode) toggleCompareMode();
    if(appState.selected) addToCompare(appState.selected);
  });

  // Top buttons
  document.getElementById('resetCameraBtn').addEventListener('click', resetCamera);
  document.getElementById('compareBtn').addEventListener('click', toggleCompareMode);
  document.getElementById('compareGoBtn').addEventListener('click', openCompareAnalysis);
  document.getElementById('compareModalCloseBtn').addEventListener('click', () => {
    document.getElementById('compareModal').classList.remove('visible');
  });
  document.getElementById('quizBtn').addEventListener('click', showQuiz);
  document.getElementById('quizCloseBtn').addEventListener('click', () => {
    document.getElementById('quizOverlay').classList.remove('visible');
  });
  document.getElementById('quizNextBtn').addEventListener('click', nextQuizQuestion);
}

function onResize(){
  const w = window.innerWidth, h = window.innerHeight;
  appState.camera.aspect = w/h;
  appState.camera.updateProjectionMatrix();
  appState.renderer.setSize(w, h);
  appState.labelRenderer.setSize(w, h);
  appState.composer.setSize(w, h);
}

// =========================================================
// INTRO -> MAIN APP
// =========================================================
function enterMain(){
  const intro = document.getElementById('intro');
  intro.classList.add('fade-out');
  setTimeout(() => {
    intro.style.display = 'none';
    document.getElementById('hud').classList.add('active');
  }, 1100);
}

// =========================================================
// INTRO PARTICLES
// =========================================================
function createIntroParticles(){
  const container = document.getElementById('particles');
  const count = 20;
  for(let i=0; i<count; i++){
    const p = document.createElement('div');
    p.className = 'particle' + (Math.random() > 0.65 ? ' pink' : '');
    p.style.left = Math.random()*100 + '%';
    p.style.animationDelay = -(Math.random()*12) + 's';
    p.style.animationDuration = (8 + Math.random()*8) + 's';
    container.appendChild(p);
  }
}

// =========================================================
// LOOP PRINCIPAL
// =========================================================
function animate(){
  requestAnimationFrame(animate);
  appState.controls.update();

  // Hover detection
  updateHover();

  // Idle rotation suave cuando no hay interacción
  appState.elementMeshes.forEach(em => {
    if(em.mesh === appState.hovered){
      em.mesh.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.15);
      if(em.mesh.userData.halo){
        em.mesh.userData.halo.rotation.z += 0.01;
      }
    } else {
      em.mesh.scale.lerp(new THREE.Vector3(1,1,1), 0.1);
    }
  });

  appState.composer.render();
  appState.labelRenderer.render(appState.scene, appState.camera);
}

// =========================================================
// ARRANQUE
// =========================================================
function start(){
  createIntroParticles();
  initScene();
  buildElements();
  bindEvents();
  animate();
  // ocultar loader
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 300);
}


// Iniciar cuando el documento esté disponible.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
