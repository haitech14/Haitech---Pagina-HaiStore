/** Tipografías críticas (woff2 latin). Español cubierto por latin; evita ~5 subsets extra.
 *  Sin 500: `font-medium` se mapea a 400 en index.css (~19KB menos en el critical path). */
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
