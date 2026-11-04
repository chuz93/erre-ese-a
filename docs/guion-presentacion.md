# Guion de la presentación: RSA con el Marine, el Cyberdemon y el Imp

Duración objetivo: **10 minutos**. Controlas el ritmo con `→` y `←`; nada avanza solo.
Cada paso tiene tres partes:

- **En pantalla:** lo que ve el público.
- **Lo que dices:** texto hablado, listo para leer o adaptar con tus palabras.
- **Para que lo entiendas tú:** la explicación detrás, por si te preguntan.

---

## 0. Antes de empezar (no cuenta en los 10 minutos)

- Abre https://erresa.vercel.app/ (o la copia local: `npm run build` y luego `npm run serve:backup`, y abre `http://localhost:8080`).
- Pulsa `F` para pantalla completa. Pulsa `Home` para estar en el paso 1.
- Teclas: `→` / `PageDown` avanza, `←` / `PageUp` retrocede. Si usas un control remoto, normalmente manda PageUp/PageDown.
- Pie de página: `motor: wasm` es lo normal; `motor: js` también funciona igual.

## Los números (memorízalos, son pocos)

| Qué | Valor | De dónde sale |
| --- | --- | --- |
| p, q (secretos) | 3 y 11 | los elige el Cyberdemon |
| n (público) | 33 | 3 × 11 |
| φ (secreto) | 20 | (3 − 1) × (11 − 1) |
| e (público) | 3 | un número sin factores comunes con 20 |
| d (secreto) | 7 | 3 × 7 = 21 = 1 + 20 |
| m (mensaje) | 4 | lo que quiere mandar el Marine |
| c (cifrado) | 31 | 4³ = 64 y 64 mod 33 = 31 |

**Clave pública** = (e, n) = (3, 33). **Clave privada** = d = 7 (y φ, p, q que se quedan secretos).

## Tres ideas que lo explican todo

**1. "mod" es el resto de una división.** 64 mod 33 = 31, porque 64 = 1 × 33 + 31. Piensa en un reloj de 33 horas: das vueltas y lo que importa es dónde quedas. Los números "se enrollan".

**2. Multiplicar es fácil; deshacer la multiplicación es difícil.** Dados 3 y 11, 3 × 11 = 33 es inmediato. Dado 33, encontrar 3 y 11 se llama *factorizar*. Con 33 se ve de un vistazo; con un número de 617 dígitos nadie conoce un método eficiente. Toda la seguridad de RSA descansa en esto.

**3. Elevar a una potencia y luego a otra puede devolverte al principio.** Las potencias de 4 módulo 33 giran en un ciclo: 4, 16, 31, 25, 1, y vuelven a 4. Cifrar es dar un salto en ese ciclo y descifrar es dar otro salto que cae justo donde empezaste. Eso es el paso 8.

---

## Paso 1: "El mensaje" (0:40)

**En pantalla:** el Marine con la burbuja "4"; el Imp dice "Escucho todo…".

**Lo que dices:**
"Imaginen que el Marine quiere mandarle un número secreto al Cyberdemon: el 4. El problema es que el cable no es seguro, y el Imp escucha todo lo que pasa. Es justo el escenario de un atacante capturando tráfico. La pregunta: ¿cómo mandamos el 4 sin que el Imp lo entienda, y sin que el Marine y el Cyberdemon se hayan puesto de acuerdo antes en una contraseña? Eso lo resuelve RSA."

**Para que lo entiendas tú:** RSA es *asimétrico*: hay una clave para cifrar que puede ser pública y otra distinta para descifrar que se queda secreta. Por eso no hace falta que se pongan de acuerdo antes.

## Paso 2: "Dos primos secretos" (1:10)

**En pantalla:** el Cyberdemon con el panel SECRETO: p = 3, q = 11. Debajo: "3 y 11 son primos: solo el 1 y ellos mismos los dividen".

**Lo que dices:**
"Todo empieza con el Cyberdemon, que elige en secreto dos números primos: 3 y 11. Un primo es un número que solo se divide entre 1 y entre sí mismo: 2, 3, 5, 7, 11… Todo número se forma multiplicando primos, y de una sola manera. Esa unicidad es lo que vamos a usar como candado. Aquí usamos primos chiquitos para poder hacer las cuentas a mano; en la vida real tienen unos 300 dígitos cada uno."

**Para que lo entiendas tú:** que cada número se descomponga en primos de una única forma (teorema fundamental de la aritmética) significa que 33 solo puede ser 3 × 11. Quien conozca 33 pero no 3 y 11 no puede reconstruir la clave privada sin factorizar.

## Paso 3: "Multiplicar: la dirección fácil" (1:00)

**En pantalla:** panel PÚBLICO con n = 33 y panel SECRETO con p y q. Línea: "n = p × q = 3 × 11 = 33".

**Lo que dices:**
"El Cyberdemon multiplica sus dos primos: 3 por 11 son 33. Ese 33 sí lo hace público; el 3 y el 11 se quedan secretos. Multiplicar es fácil. Volver atrás, es decir, dado 33 encontrar 3 y 11, se llama factorizar. Con el 33 se ve de un vistazo, pero con un número de más de 600 dígitos nadie sabe hacerlo en un tiempo razonable. Esa diferencia entre lo fácil y lo difícil es la base de RSA."

**Para que lo entiendas tú:** es una función de "un solo sentido". Lo único difícil es *factorizar*; no se ha demostrado que sea imposible, pero no se conoce un método eficiente para números grandes.

## Paso 4: "Construir la clave pública" (1:30)

**En pantalla:** φ = (3 − 1)(11 − 1) = 20; "e = 3, mcd(3, 20) = 1"; "Clave pública (e, n) = (3, 33)". El Marine dice "Recibo (e, n) = (3, 33)" y un paquete 🔑 viaja del Cyberdemon al Marine.

**Lo que dices:**
"Ahora el Cyberdemon calcula un número auxiliar, φ: (3 − 1) por (11 − 1), que da 20. φ cuenta cuántos números del 1 al 33 no comparten ningún factor con 33. Esto solo se calcula fácil si conoces los primos. Después escoge un número e que no comparta factores con 20: elige 3. Y publica la pareja (3, 33): esa es la **clave pública**. Mírenla viajar hasta el Marine. Pero ojo: el Imp también la ve, y no pasa nada. φ y los primos siguen secretos."

**Para que lo entiendas tú:**
- **¿Por qué (p − 1)(q − 1)?** Entre 1 y 33 hay 33 números. Quita los múltiplos de 3 (hay 11) y los de 11 (hay 3), pero el 33 se quitó dos veces, así que suma 1: 33 − 11 − 3 + 1 = 20. En general pq − p − q + 1 = (p − 1)(q − 1).
- **¿Por qué e sin factores comunes con φ?** Para que exista el número que "deshace" a e (el inverso modular), que es d en el paso 7. Si e y φ compartieran un factor, no habría forma de descifrar.

## Paso 5: "Cifrar" (1:00)

**En pantalla:** burbuja del Marine: "Cifro 4 con (3, 33)". Líneas: "c = m^e mod n" y "c = 4^3 mod 33 = 64 mod 33 = 31". Un paquete 🔒 31 viaja hacia el Cyberdemon.

**Lo que dices:**
"El Marine toma su mensaje, el 4, lo eleva a la potencia e, que es 3: 4 por 4 por 4 son 64. Y ahora lo 'enrolla' módulo 33: 64 dividido entre 33 cabe una vez y sobran 31. El mensaje cifrado es 31. Eso es lo que viaja por el cable."

**Para que lo entiendas tú:** usamos m = 4 a propósito: 4³ = 64 es mayor que 33, así que el "mod" realmente actúa. Con m = 2 saldría 8, sin dar la vuelta, y bastaría sacar raíz cúbica para descifrar. En RSA real también se añade *relleno aleatorio* (padding, p. ej. OAEP) y e suele ser 65537, no 3.

## Paso 6: "El Imp intercepta" (1:15)

**En pantalla:** etiqueta TAMAÑO REAL. El Imp: "n = 33, e = 3, c = 31. Sin φ, no hay d." Líneas: "Sin φ no hay d, y φ necesita p y q. Una n real no se factoriza." y "(Con n = 33 de juguete sí la factoriza: 33 = 3 × 11.)".

**Lo que dices:**
"El Imp lo ve todo: la clave pública, n = 33 y e = 3, y el mensaje cifrado, 31. ¿Qué le falta? El número secreto d. Para calcular d necesita φ, y para calcular φ necesita los primos p y q, o sea, factorizar el 33. Y aquí hay que ser honestos: con nuestro 33 de juguete, el Imp lo factoriza al instante, 3 por 11, y rompe todo. Por eso es de juguete. Con una n real de unos 617 dígitos, que es lo que se usa hoy, no se conoce una forma eficiente de hacerlo, y el Imp se queda atascado."

**Para que lo entiendas tú:** el Imp podría también probar los 33 mensajes posibles, pero eso solo funciona porque aquí hay muy pocos. Con 2048 bits (≈ 617 dígitos) y relleno no sirve. 2048 bits = 617 dígitos decimales (2048 × log₁₀2).

## Paso 7: "Descifrar con la clave privada" (1:15)

**En pantalla:** "d = e⁻¹ mod φ: 3 × 7 = 21 = 1 mod 20 → d = 7" y "m = c^d mod n = 31^7 mod 33 = 4". El Cyberdemon dice "4"; el panel SECRETO muestra φ = 20 y d = 7.

**Lo que dices:**
"El Cyberdemon sí conoce φ, así que puede calcular d: el número que, multiplicado por e, deja resto 1 módulo φ. 3 por 7 son 21, y 21 es 1 más 20, o sea, resto 1. Entonces d es 7. Ahora eleva el mensaje cifrado a d: 31 elevado a la 7, módulo 33, da 4. ¡Recuperó el mensaje original!"

**Para que lo entiendas tú:** d es el *inverso modular* de e módulo φ. Con números grandes se calcula con el algoritmo de Euclides extendido. **Truco para comprobar 31⁷ a mano:** 31 ≡ −2 (mod 33), así que 31⁷ ≡ (−2)⁷ = −128, y −128 + 4 × 33 = 4 ✓.

## Paso 8: "Por qué funciona" (1:30)

**En pantalla:** la rueda de 5 valores (1, 4, 16, 31, 25). Un marcador amarillo: "Inicio: m = 4" → "Cifrar (elevar a e = 3): 4 → 31" → "Descifrar (elevar a d = 7): 31 → 4". Abajo: "e × d = 3 × 7 = 21 = 1 + 1 × 20" y "Las potencias de 4 mod 33 forman un ciclo: 4, 16, 31, 25, 1".

**Lo que dices:**
"¿Por qué le devuelve exactamente el 4? Miren la rueda: si vamos elevando el 4 a potencias, módulo 33, los resultados giran en círculo: 4, 16, 31, 25, 1, y otra vez 4. Cifrar es dar un salto en esta rueda: del 4 al 31. Descifrar es otro salto que cae justo donde empezamos. Y no es casualidad: e por d es 21, que es *uno más* una vuelta de 20. Y dar vueltas completas no mueve nada; solo cuenta ese 'uno más', que te deja otra vez en el mensaje."

**Para que lo entiendas tú:**
- La razón formal (teorema de Euler): si m no comparte factores con n, entonces m^φ ≡ 1 (mod n). Aquí 4²⁰ mod 33 = 1 (el ciclo de 5 cabe 4 veces en 20).
- Como e × d = 1 + k × φ (aquí k = 1): (m^e)^d = m^(1 + kφ) = m × (m^φ)^k ≡ m × 1 = m.
- **Intuición para el público:** el ciclo tiene 5 posiciones. Cifrar avanza 2 (de la posición 1 a la 3) y descifrar avanza 3 (de la 3 a la 1, pasando por el inicio): 2 + 3 = 5, una vuelta completa. Esta cuenta es de *este* ejemplo; no es una regla general, úsala solo como imagen.

## Paso 9: "El Imp nunca lo descifró" (0:40)

**En pantalla:** el Imp dice "No logré descifrarlo…"; el Marine dispara y el Imp cae muerto (sale una calavera 💀). Abajo: "El Imp tiene n = 33, e = 3 y c = 31, pero no tiene d." / "El mensaje 4 llegó seguro al Cyberdemon." / "Clave pública para cifrar, clave privada para descifrar." El Cyberdemon muestra "4", el mensaje recibido.

**Lo que dices:**
"Y aquí termina la historia: el Imp tenía todo lo público (n, e y el mensaje cifrado) pero nunca tuvo d, y sin d no pudo descifrar nada. El mensaje llegó seguro al Cyberdemon, y el Imp… bueno, el Marine se encargó de él."

**Para que lo entiendas tú:** la animación empieza sola al llegar al paso (el Marine dispara ~1 s después y el Imp cae ~0,6 s más tarde) y se repite cada vez que vuelves a entrar. Es solo un cierre narrativo: la seguridad viene de que el Imp no puede calcular d, no del disparo.

## Cierre (se dice sobre el paso 9; ya cuenta dentro de sus 0:40)

**Lo que dices:**
"En resumen: la clave pública cifra y la privada descifra, y esa diferencia existe porque multiplicar es fácil y factorizar es difícil. El Imp ve todo el tráfico, pero sin poder factorizar n no entiende el contenido. Y una conexión con nuestra materia: justo por eso el análisis de tráfico no ve el contenido cifrado, y por eso un atacante activo intentaría otra cosa: cambiar la clave pública por la suya. Para eso existen los certificados. Gracias."

---

## Preguntas probables (con respuesta corta)

**¿Por qué primos y no cualquier número?**
Porque cada número se descompone en primos de una sola manera (eso da el candado) y porque con dos primos φ es fácil de calcular, (p − 1)(q − 1), pero solo si los conoces. Si n fuera primo, φ = n − 1 sería público y no habría secreto.

**¿Y si el Imp prueba todos los mensajes posibles?**
Aquí hay solo 33, así que sí podría. En real los mensajes se rellenan con datos aleatorios (OAEP) y, además, normalmente RSA solo cifra una clave temporal (AES) con la que se cifra el resto.

**¿Qué pasa si el mensaje es mayor que n?**
Debe ser menor que n. Por eso en la práctica se cifra una clave corta, no el mensaje completo.

**¿Funciona con cualquier mensaje?**
Sí, con los 33 posibles. Lo comprobé: para todo m entre 0 y 32, descifrar(cifrar(m)) = m. Incluso con m = 3, que comparte factor con 33: c = 27 y 27⁷ mod 33 = 3 (funciona porque n = p·q con p ≠ q; el detalle es del teorema chino del resto). Curiosidad: m = 10 se cifra a sí mismo (10³ mod 33 = 10); con relleno aleatorio esto no importa.

**¿Es esto lo que usa HTTPS hoy?**
En TLS 1.3 el intercambio de claves ya no usa RSA (usa Diffie-Hellman con curvas elípticas). RSA sigue muy presente en las *firmas* y los *certificados*. La idea matemática es la que vimos.

**¿Qué ataques existen?**
Factorizar n (los mejores algoritmos clásicos, como la criba general del cuerpo de números, no son eficientes para 2048 bits); malas generaciones de primos (p y q mal elegidos o repetidos); ataques de canal lateral (tiempos, consumo); y un ordenador cuántico suficientemente grande con el algoritmo de Shor lo rompería.

**¿Cuántos dígitos se usan hoy?**
Al menos 2048 bits, unos 617 dígitos decimales.

**¿Qué relación tiene con detección de intrusiones?**
Un IDS de red ve el tráfico, pero si va cifrado con TLS solo ve metadatos (direcciones, tamaños, el inicio de la conexión), no el contenido. Y un atacante activo (hombre en el medio) puede sustituir la clave pública por la suya: por eso se usan certificados firmados que autentican la clave.

---

## Si algo falla (plan B)

- **No carga la página:** usa la copia local (`npm run build` y `npm run serve:backup`, `http://localhost:8080`).
- **El pie dice `motor: js`:** no pasa nada; funciona igual.
- **El proyector corta la pantalla:** pulsa `F` para salir o entrar de pantalla completa. La imagen se ajusta sola a cualquier tamaño.
- **Te pierdes en un paso:** `←` y `→` van y vienen; `Home` y `End` saltan al principio y al final.
- **Vas corto de tiempo:** salta a explicar solo lo esencial: pasos 2-3 (candado), 5 (cifrar), 7 (descifrar) y 8 (por qué).

## Consejos para ensayar

1. Ensáyalo en voz alta al menos 3 veces con cronómetro. Objetivo: 9 a 10 minutos.
2. En cada paso, di primero **qué va a pasar** y luego pulsa la tecla: así el público mira lo que dices.
3. No leas las ecuaciones símbolo por símbolo; di la idea ("64 entre 33 cabe una vez y sobran 31").
4. Si te preguntan algo que no sabes: "buena pregunta, no lo sé con certeza, lo reviso". Es mejor que improvisar.
