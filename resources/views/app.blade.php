<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    class="{{ ($appearance ?? 'system') == 'dark' ? 'dark' : '' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Primary SEO Meta Tags --}}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="bingbot" content="index, follow">

    {{-- Default meta description (can be overridden by Inertia Head) --}}
    <meta name="description"
        content="Big Property - Situs jual beli properti terpercaya di Indonesia. Temukan rumah, apartemen, tanah, dan properti impian Anda dengan mudah.">
    <meta name="keywords"
        content="jual beli properti, rumah dijual, apartemen, tanah, properti indonesia, big property">
    <meta name="author" content="Big Property">

    {{-- Open Graph / Facebook --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Big Property">
    <meta property="og:locale" content="id_ID">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">

    {{-- Mobile & PWA --}}
    <meta name="theme-color" content="#C5E62A">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="format-detection" content="telephone=no">

    {{-- Performance: DNS Prefetch & Preconnect for external resources --}}
    <link rel="dns-prefetch" href="https://res.cloudinary.com">
    <link rel="dns-prefetch" href="https://storage.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.bunny.net">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">

    <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
    <link rel="preconnect" href="https://storage.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }

        /* Critical CSS for preventing layout shift */
        img {
            max-width: 100%;
            height: auto;
        }

        /* Skeleton loading state for images */
        .img-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
        }

        @verbatim @keyframes skeleton-loading {
                0% {
                    background-position: 200% 0;
                }

                100% {
                    background-position: -200% 0;
                }
            }

        @endverbatim
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    {{-- Favicons --}}
    <link rel="icon" type="image/svg+xml" href="/logo-carihunian-warna.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/logo-carihunian-warna.svg">

    {{-- Preload critical fonts --}}
    <link rel="preload" as="style" href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet">
    {{-- CariHunian Brand Fonts: Bricolage Grotesque (heading), Outfit (body/label), Poppins (tagline) --}}
    <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400&display=swap"
        rel="stylesheet">

    {{-- Preload LCP image hint (hero banner) --}}


    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/" . $page['component'] . ".tsx"])
    @inertiaHead

    {{-- Structured Data: Organization --}}
    @verbatim
        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "CariHunian",
                "url": "https://carihunian.co",
                "logo": "https://carihunian.co/logo-carihunian-warna.svg",
                "sameAs": [
                    "https://www.facebook.com/carihunian.co",
                    "https://www.instagram.com/carihunian.co"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": ["Indonesian", "English"]
                }
            }
            </script>

        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "CariHunian",
                "url": "https://carihunian.co",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://carihunian.co/beli?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            }
            </script>
    @endverbatim
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>