# Sweet Lips

Sweet Lips is an affordable, cruelty-free lip care and cosmetics brand from Durban, South Africa. This repository contains the brand's website (WEDE5020 Portfolio of Evidence, Parts 1 to 3).

## Pages
| `index.html` | Home: hero, favourites, limited edition banner, why shop, stats |
| `about.html` | Brand story, mission, vision, values, founder |
| `products.html` | Product catalogue with search, price sorting, lightbox and add to cart |
| `cart.html` / `checkout.html` | Cart and 3-step on-site checkout with printable receipt |
| `reviews.html` | Customer reviews (visitors can add their own) |
| `faq.html` | Accordion FAQ (visitors can ask questions) |
| `enquiry.html` | Product enquiry form with instant price/availability response |
| `contact.html` | Validated contact form (compiled into an email) and Leaflet map |
| `social.html` | Social media links |

## Features (Part 3)
- **Interactive elements:** responsive navigation with mobile menu, FAQ accordion, hover and fade animations, slide-out mini cart.
- **Dynamic content and search:** reviews are rendered from JavaScript; products can be searched and sorted by price.
- **Gallery lightbox:** click any product image to enlarge; arrow keys and Esc work.
- **Interactive map:** Leaflet and OpenStreetMap map of Durban on the contact page.
- **Forms:** HTML5 + JavaScript validation (SA phone numbers, email, 4-digit postal codes, Luhn card check, future expiry, minimum lengths) with clear error messages.
- **Shopping cart and checkout:** cart saved in `localStorage`; checkout has delivery, payment (Card, EFT, Cash on Delivery) and review steps, then a confirmation with order reference. This is a demo: no real payment is processed and card numbers are never stored.
- **SEO:** unique title tags, meta descriptions and keywords per page, heading structure, descriptive alt text and image file names, lazy-loaded images, internal links, mobile-friendly viewport, JSON-LD business data, `robots.txt`, `sitemap.xml`.
- **Security / speed:** `_headers` file (Netlify) with security headers, `rel="noopener noreferrer"` on external links, deferred font loading with `display=swap`, lazy-loaded images, no card data stored.

## Project structure
```
css/style.css     main stylesheet (design tokens, typography, layout, responsive rules)
css/extras.css    Part 3 components (nav, forms, lightbox, map, mini cart, checkout)
js/site.js        validation, search/sort, reviews, FAQ, lightbox, map, nav toggle
js/cart.js        add to cart, cart page, nav cart count
js/minicart.js    slide-out cart
js/checkout.js    checkout steps, validation and receipt
images/           product and brand images
```

## Running locally
Open `index.html` in a browser, or open the folder in VS Code and use the Live Server extension. No build step is needed.

**Image names:** run `rename-images.bat` (Windows) or `rename-images.sh` (Mac/Linux) once. It copies the original photos to descriptive, hyphenated file names that the pages now use.

## Deployment
1. Push the project to GitHub.
2. Netlify: drag the project folder onto app.netlify.com/drop, or connect the GitHub repository.
3. Replace `YOUR-SITE.netlify.app` in `robots.txt` and `sitemap.xml` with the real address, and update the live link above.

## Changelog

### Part 3: feedback from Part 2). 
Each was addressed as follows.
 What was changed 
|---|---|
| Default style code (2/5) | Added a `:root` block of design tokens (colours and fonts) to `style.css`. Fixed errors (`14PX`, mixed `rgb()` alpha syntax, a misspelt comment). Removed duplicate and dead rules. Loaded the Poppins font that the stylesheet already referenced but never loaded. |
| Typography (3/5) | One heading scale with Georgia headings and Poppins body text; fluid sizes with `clamp()`; consistent line heights. |
| Layout structure (2/5) | Products now use a responsive CSS grid of cards instead of one long column. Multi-product cards (packages, limited edition) span the full width. Sticky header with a flex navigation bar. |
| Media queries (4/10) | The old media queries targeted a `.products` class and a flex nav that did not exist. Replaced with working breakpoints for large screens, tablet (900px, 768px) and mobile (480px). |
| Responsive navigation | The text menu with `\|\|` separators was replaced by a proper navigation bar with a current-page indicator that collapses into a menu button on screens narrower than 900px. |
| Responsive images (2/5) | Removed the `srcset` and `sizes` attributes, which listed the same file three times and had an invalid `sizes` value. Images are now fluid (`max-width: 100%`), fixed-height in cards with `object-fit`, and lazy-loaded. |
| Pseudo-classes (7/10) | Added `:focus-visible`, `:active`, `:nth-child`, `:first-child`, `:checked`, `:disabled`, `:has()`, `:not()`, `[open]` and `::selection` styles. |
| Markup fixes | Fixed `index.html` structure, the `<br.` typo, the empty `product-grid` div and about-page spelling. |
| Part 1 feedback (4/10) | Navigation uses a real list in a `nav` landmark, the 'Delivered nationwide?' wording was corrected, and each page now has a unique title and meta description. |

### Part 3: new work
- Added `enquiry.html` and a validated contact form with email compilation and a Leaflet map.
- Added the working cart, mini cart, three-step checkout and printable receipt.
- Added search, sorting, lightbox, accordion FAQ, visitor reviews and visitor questions.
- Added meta descriptions, keywords, JSON-LD, descriptive alt text and image file names, `robots.txt`, `sitemap.xml` and `_headers`.
- Redesigned the home page using the brand's soft pink palette.
- Added a "Continue Shopping" button on the cart page and a floating mini cart so visitors can keep shopping without losing their place.

## Known limitations
- Reviews, questions, carts and orders are stored in the visitor's browser only (no database).
- Payment is simulated.
- The contact form opens the visitor's email app (`mailto:`) rather than sending from a server.

## References
- Leaflet. (2023). *Leaflet: an open-source JavaScript library for interactive maps* (Version 1.9.4). https://leafletjs.com
- OpenStreetMap contributors. *Copyright and licence*. https://www.openstreetmap.org/copyright
- MDN Web Docs. *Client-side form validation*. https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
- MDN Web Docs. *Using media queries*. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
- Google Search Central. *SEO Starter Guide*. https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Fonts. *Poppins*. https://fonts.google.com/specimen/Poppins
- Netlify Docs. *Custom headers*. https://docs.netlify.com/manage/routing/headers/



