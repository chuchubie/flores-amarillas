
const jardin = document.querySelector("#jardin");
const contenedorFlores = document.querySelector("#flores");

if (!jardin || !contenedorFlores) {
    console.error("No se encontró el jardín o el contenedor de flores.");
} else {
    iniciarJardin();
}

function iniciarJardin() {
    const colores = [
        { petalos: "#FFF2A6", centro: "#D99A24" },
        { petalos: "#FFE477", centro: "#B97920" },
        { petalos: "#FFD34F", centro: "#A96D18" },
        { petalos: "#F8C94E", centro: "#E5A52B" },
        { petalos: "#FFF8CC", centro: "#D6A126" },
        { petalos: "#F4D35E", centro: "#A66C16" },
        { petalos: "#FFDF8A", centro: "#C78C25" },
        { petalos: "#F9E7A0", centro: "#B77B22" },
        { petalos: "#F6BD60", centro: "#9C641C" },
        { petalos: "#FCEFB4", centro: "#C58B24" },
        { petalos: "#FFECA1", centro: "#B8832D" },
        { petalos: "#F7D875", centro: "#A86D20" }
    ];

    const coloresHojas = [
        "#8FA17A",
        "#A5B58A",
        "#718B61",
        "#B2BE91",
        "#9BAE7C",
        "#7D9669",
        "#BCC69B",
        "#82976A"
    ];

    const CONFIG = {
        separacion: 17,
        radio: 880,
        fuerza: 800,
        suavidad: 0.13,
        cantidadProtagonistas: 14,
        tamanoProtagonistas: 76,
        areaPorHoja: 5500,
        floresExtraPorArea: 7500
    };

    let elementos = [];
    let cursorX = -10000;
    let cursorY = -10000;
    let animacionActiva = false;
    let ultimoTiempo = 0;
    let temporizadorResize;
    let solicitudAnimacion = null;

    // Adaptar el jardín al tamaño de pantalla.
    function adaptarJardin(ancho, alto) {
        const ladoMenor = Math.min(ancho, alto);

        if (ancho <= 600) {
            // Celulares.
            CONFIG.separacion = 23;
            CONFIG.radio = Math.min(430, ladoMenor * 0.75);
            CONFIG.fuerza = 440;
            CONFIG.cantidadProtagonistas = 8;
            CONFIG.tamanoProtagonistas = 58;
            CONFIG.areaPorHoja = 7000;
            CONFIG.floresExtraPorArea = 10000;
        } else if (ancho <= 900) {
            // Tablets y pantallas medianas.
            CONFIG.separacion = 20;
            CONFIG.radio = Math.min(600, ladoMenor * 0.75);
            CONFIG.fuerza = 600;
            CONFIG.cantidadProtagonistas = 11;
            CONFIG.tamanoProtagonistas = 68;
            CONFIG.areaPorHoja = 6000;
            CONFIG.floresExtraPorArea = 8500;
        } else {
            // PC: valores originales.
            CONFIG.separacion = 17;
            CONFIG.radio = 750;
            CONFIG.fuerza = 750;
            CONFIG.cantidadProtagonistas = 14;
            CONFIG.tamanoProtagonistas = 76;
            CONFIG.areaPorHoja = 5500;
            CONFIG.floresExtraPorArea = 7500;
        }
    }

    // Dibujar los pétalos de una flor.
    function dibujarPetalos(tipo, color) {
        const formas = [
            { cantidad: 12, y: -12, rx: 4.5, ry: 8 },
            { cantidad: 6, y: -9, rx: 6.5, ry: 10 },
            { cantidad: 16, y: -12, rx: 3.5, ry: 9 },
            { cantidad: 5, y: -7, rx: 5.5, ry: 7 },
            { cantidad: 8, y: -11, rx: 5, ry: 8 }
        ];

        const forma = formas[tipo];

        return Array.from(
            { length: forma.cantidad },
            (_, i) => `
                <ellipse
                    cx="0"
                    cy="${forma.y}"
                    rx="${forma.rx}"
                    ry="${forma.ry}"
                    transform="rotate(${i * 360 / forma.cantidad})"
                    fill="${color}"
                    stroke="#B98527"
                    stroke-opacity="0.12"
                    stroke-width="0.5"
                />
            `
        ).join("");
    }

    // Actualizar la posición de una flor o una hoja.
    function dibujarElemento(elemento) {
        elemento.nodo.style.transform = `
            translate3d(
                ${elemento.x + elemento.dx}px,
                ${elemento.y + elemento.dy}px,
                0
            )
            translate(-50%, -50%)
            rotate(${elemento.giro}deg)
        `;
    }

    // Crear una flor.
    function crearFlor(x, y, fragmento, tamanoForzado = null) {
        const nodo = document.createElement("div");

        nodo.className = tamanoForzado !== null
            ? "flor flor-protagonista"
            : "flor";

        let tamano = tamanoForzado;

        if (tamano === null) {
            const azar = Math.random();

            if (azar < 0.24) {
                tamano = 24 + Math.random() * 10;
            } else if (azar < 0.60) {
                tamano = 30 + Math.random() * 12;
            } else if (azar < 0.86) {
                tamano = 40 + Math.random() * 14;
            } else {
                tamano = 50 + Math.random() * 14;
            }
        }

        const tipo = Math.floor(Math.random() * 5);
        const color = colores[
            Math.floor(Math.random() * colores.length)
        ];

        nodo.style.width = `${tamano}px`;
        nodo.style.height = `${tamano}px`;

        nodo.innerHTML = `
            <svg viewBox="-22 -22 44 44"
                 xmlns="http://www.w3.org/2000/svg"
                 aria-hidden="true">
                ${dibujarPetalos(tipo, color.petalos)}

                <circle
                    cx="0"
                    cy="0"
                    r="${tipo === 2 ? 5.5 : 4.5}"
                    fill="${color.centro}"
                />

                <circle
                    cx="-1.3"
                    cy="-1.5"
                    r="1"
                    fill="#FFF1B2"
                    opacity="0.7"
                />
            </svg>
        `;

        const elemento = {
            nodo,
            x,
            y,
            giro: Math.random() * 360,
            dx: 0,
            dy: 0
        };

        elementos.push(elemento);
        fragmento.appendChild(nodo);

        return elemento;
    }

    // Crear una hoja verde.
    function crearHoja(x, y, fragmento) {
        const nodo = document.createElement("div");
        nodo.className = "flor hoja";

        const ancho = 15 + Math.random() * 13;
        const alto = 23 + Math.random() * 17;

        const color = coloresHojas[
            Math.floor(Math.random() * coloresHojas.length)
        ];

        nodo.style.width = `${ancho}px`;
        nodo.style.height = `${alto}px`;

        nodo.innerHTML = `
            <svg viewBox="-12 -16 24 32"
                 xmlns="http://www.w3.org/2000/svg"
                 aria-hidden="true">
                <path
                    d="M 0,14 C -13,5 -9,-12 0,-14
                       C 11,-10 13,5 0,14 Z"
                    fill="${color}"
                    stroke="#637B53"
                    stroke-opacity="0.5"
                    stroke-width="0.6"
                />

                <path
                    d="M 0,11 Q 0,0 0,-10"
                    fill="none"
                    stroke="#637B53"
                    stroke-width="0.9"
                    stroke-linecap="round"
                />

                <path
                    d="M 0,3 L -4,-2 M 0,-3 L 4,-7"
                    fill="none"
                    stroke="#637B53"
                    stroke-opacity="0.7"
                    stroke-width="0.6"
                    stroke-linecap="round"
                />
            </svg>
        `;

        const elemento = {
            nodo,
            x,
            y,
            giro: Math.random() * 360,
            dx: 0,
            dy: 0
        };

        elementos.push(elemento);
        fragmento.appendChild(nodo);

        return elemento;
    }

    // Distribuir las flores protagonistas.
    function crearProtagonistas(ancho, alto) {
        const posiciones = [];
        const columnas = 5;
        const filas = 3;

        for (let fila = 0; fila < filas; fila++) {
            for (let columna = 0; columna < columnas; columna++) {
                posiciones.push({
                    x: (columna + 0.5) * ancho / columnas
                        + (Math.random() - 0.5)
                        * ancho / columnas * 0.3,

                    y: (fila + 0.5) * alto / filas
                        + (Math.random() - 0.5)
                        * alto / filas * 0.3
                });
            }
        }

        for (let i = posiciones.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [posiciones[i], posiciones[j]] =
                [posiciones[j], posiciones[i]];
        }

        return posiciones.slice(
            0,
            CONFIG.cantidadProtagonistas
        );
    }

    // Construir todas las flores y hojas.
    function llenarJardin() {
        const ancho = jardin.clientWidth;
        const alto = jardin.clientHeight;

        if (!ancho || !alto) return;

        adaptarJardin(ancho, alto);

        const fragmento = document.createDocumentFragment();

        elementos = [];

        const protagonistas = crearProtagonistas(ancho, alto);
        const paso = CONFIG.separacion;

        // Flores pequeñas y medianas.
        for (let y = -paso; y < alto + paso; y += paso) {
            for (let x = -paso; x < ancho + paso; x += paso) {
                crearFlor(
                    x + (Math.random() - 0.5) * 12,
                    y + (Math.random() - 0.5) * 12,
                    fragmento
                );
            }
        }

        // Flores protagonistas.
        for (const posicion of protagonistas) {
            crearFlor(
                posicion.x,
                posicion.y,
                fragmento,
                CONFIG.tamanoProtagonistas + Math.random() * 12
            );
        }

        // Flores adicionales.
        const cantidadExtra = Math.floor(
            ancho * alto / CONFIG.floresExtraPorArea
        );

        for (let i = 0; i < cantidadExtra; i++) {
            crearFlor(
                Math.random() * ancho,
                Math.random() * alto,
                fragmento,
                25 + Math.random() * 18
            );
        }

        // Hojas verdes.
        const cantidadHojas = Math.floor(
            ancho * alto / CONFIG.areaPorHoja
        );

        for (let i = 0; i < cantidadHojas; i++) {
            crearHoja(
                Math.random() * ancho,
                Math.random() * alto,
                fragmento
            );
        }

        contenedorFlores.replaceChildren(fragmento);

        for (const elemento of elementos) {
            dibujarElemento(elemento);
        }

        console.log(`Jardín creado: ${elementos.length} elementos.`);
    }

    // Detectar el mouse y el tacto.
    function actualizarCursor(evento) {
        if (document.hidden) return;

        const rect = jardin.getBoundingClientRect();

        cursorX = evento.clientX - rect.left;
        cursorY = evento.clientY - rect.top;

        iniciarAnimacion();
    }

    // PC y celular.
    jardin.addEventListener("pointermove", actualizarCursor);
    jardin.addEventListener("pointerdown", actualizarCursor);

    // Al levantar el dedo, las flores vuelven a su posición.
    function finalizarToque(evento) {
        if (evento.pointerType === "touch") {
            cursorX = -10000;
            cursorY = -10000;
            iniciarAnimacion();
        }
    }

    jardin.addEventListener("pointerup", finalizarToque);
    jardin.addEventListener("pointercancel", finalizarToque);

    // Al salir con el mouse, restablecer la posición.
    jardin.addEventListener("pointerleave", (evento) => {
        if (evento.pointerType !== "touch") {
            cursorX = -10000;
            cursorY = -10000;
            iniciarAnimacion();
        }
    });

    // Iniciar una sola animación a la vez.
    function iniciarAnimacion() {
        if (document.hidden) {
            animacionActiva = false;
            solicitudAnimacion = null;
            return;
        }

        if (animacionActiva) return;

        animacionActiva = true;
        ultimoTiempo = 0;
        solicitudAnimacion = requestAnimationFrame(animar);
    }

    // Animar las flores.
    function animar(tiempo) {
        solicitudAnimacion = null;

        if (document.hidden) {
            animacionActiva = false;
            return;
        }

        if (tiempo - ultimoTiempo < 1000 / 40) {
            solicitudAnimacion = requestAnimationFrame(animar);
            return;
        }

        ultimoTiempo = tiempo;
        let hayMovimiento = false;

        for (const elemento of elementos) {
            const centroX = elemento.x + elemento.dx;
            const centroY = elemento.y + elemento.dy;

            const diferenciaX = centroX - cursorX;
            const diferenciaY = centroY - cursorY;

            const distancia = Math.hypot(
                diferenciaX,
                diferenciaY
            );

            let objetivoX = 0;
            let objetivoY = 0;

            if (distancia < CONFIG.radio && distancia > 0) {
                const intensidad = 1 - distancia / CONFIG.radio;
                const fuerza = intensidad * CONFIG.fuerza;

                objetivoX = diferenciaX / distancia * fuerza;
                objetivoY = diferenciaY / distancia * fuerza;
            }

            const dxAnterior = elemento.dx;
            const dyAnterior = elemento.dy;

            elemento.dx +=
                (objetivoX - elemento.dx) * CONFIG.suavidad;

            elemento.dy +=
                (objetivoY - elemento.dy) * CONFIG.suavidad;

            if (
                Math.abs(elemento.dx - dxAnterior) > 0.02 ||
                Math.abs(elemento.dy - dyAnterior) > 0.02
            ) {
                dibujarElemento(elemento);
            }

            if (
                Math.abs(elemento.dx) > 0.2 ||
                Math.abs(elemento.dy) > 0.2 ||
                Math.abs(objetivoX) > 0.2 ||
                Math.abs(objetivoY) > 0.2
            ) {
                hayMovimiento = true;
            }
        }

        if (hayMovimiento) {
            solicitudAnimacion = requestAnimationFrame(animar);
        } else {
            animacionActiva = false;
        }
    }

    // Si se cambia de pestaña, cancelar la animación activa.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (solicitudAnimacion !== null) {
                cancelAnimationFrame(solicitudAnimacion);
            }

            solicitudAnimacion = null;
            animacionActiva = false;
            return;
        }

        // Al volver, restablecer las flores a su posición original.
        cursorX = -10000;
        cursorY = -10000;
        ultimoTiempo = 0;
        iniciarAnimacion();
    });

    // Recuperar la animación al volver a la ventana.
    window.addEventListener("focus", () => {
        cursorX = -10000;
        cursorY = -10000;
        ultimoTiempo = 0;
        iniciarAnimacion();
    });

    // Crear el jardín al iniciar.
    llenarJardin();

    // Reorganizar las flores al cambiar el tamaño de pantalla.
    window.addEventListener("resize", () => {
        clearTimeout(temporizadorResize);

        temporizadorResize = setTimeout(() => {
            cursorX = -10000;
            cursorY = -10000;

            llenarJardin();
            iniciarAnimacion();
        }, 200);
    });
}
