import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOData } from '../../types';

interface SEOHeadProps extends Partial<SEOData> {
  children?: React.ReactNode;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'FashionHub - Your Style Destination',
  description = 'Discover the latest fashion trends and timeless classics at FashionHub. Shop women\'s, men\'s, and accessories with free shipping on orders over $100.',
  keywords = ['fashion', 'clothing', 'style', 'shopping', 'trends'],
  canonical_url,
  og_title,
  og_description,
  og_image = 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1200',
  twitter_title,
  twitter_description,
  twitter_image,
  children
}) => {
  const siteUrl = window.location.origin;
  const currentUrl = window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonical_url || currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={og_title || title} />
      <meta property="og:description" content={og_description || description} />
      <meta property="og:image" content={og_image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="FashionHub" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitter_title || og_title || title} />
      <meta name="twitter:description" content={twitter_description || og_description || description} />
      <meta name="twitter:image" content={twitter_image || og_image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="FashionHub" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "FashionHub",
          "url": siteUrl,
          "logo": `${siteUrl}/logo.png`,
          "description": description,
          "sameAs": [
            "https://facebook.com/fashionhub",
            "https://twitter.com/fashionhub",
            "https://instagram.com/fashionhub"
          ]
        })}
      </script>

      {children}
    </Helmet>
  );
};