<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="{{ ($appearance ?? 'system') == 'dark' ? 'dark' : '' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    {{-- Primary SEO Meta Tags --}}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <meta name="bingbot" content="index, follow">
    
    {{-- Default meta description (can be overridden by Inertia Head) --}}
    <meta name="description" content="Big Property - Situs jual beli properti terpercaya di Indonesia. Temukan rumah, apartemen, tanah, dan properti impian Anda dengan mudah.">
    <meta name="keywords" content="jual beli properti, rumah dijual, apartemen, tanah, properti indonesia, big property">
    <meta name="author" content="Big Property">
    
    {{-- Open Graph / Facebook --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Big Property">
    <meta property="og:locale" content="id_ID">
    
    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    
    {{-- Mobile & PWA --}}
    <meta name="theme-color" content="#ECEC5C">
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
        
        @verbatim
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        @endverbatim
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    {{-- Favicons --}}
    <link rel="icon" type="image/png" href="https://storage.googleapis.com/bigproperty_image/website_assets/logo-fav-big.png">
    <link rel="apple-touch-icon" sizes="180x180" href="https://storage.googleapis.com/bigproperty_image/website_assets/logo-fav-big.png">

    {{-- Preload critical fonts --}}
    <link rel="preload" as="style" href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet">

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
        "name": "Big Property",
        "url": "https://bigproperty.id",
        "logo": "https://storage.googleapis.com/bigproperty_image/website_assets/logo-bigproperty.png",
        "sameAs": [
            "https://www.facebook.com/bigproperty.id",
            "https://www.instagram.com/bigproperty.id"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["Indonesian", "English"]
        }
    }
    </script>
    
    {{-- Structured Data: WebSite with SearchAction --}}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Big Property",
        "url": "https://bigproperty.id",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://bigproperty.id/beli?q={search_term_string}"
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