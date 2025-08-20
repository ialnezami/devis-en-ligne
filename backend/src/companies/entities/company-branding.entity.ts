import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('company_branding')
export class CompanyBranding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @OneToOne(() => Company, company => company.branding)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Company Identity
  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tagline: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  // Visual Branding
  @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
  primaryColor: string;

  @Column({ type: 'varchar', length: 7, default: '#6B7280' })
  secondaryColor: string;

  @Column({ type: 'varchar', length: 7, default: '#10B981' })
  accentColor: string;

  @Column({ type: 'varchar', length: 7, default: '#FFFFFF' })
  backgroundColor: string;

  @Column({ type: 'varchar', length: 7, default: '#000000' })
  textColor: string;

  @Column({ type: 'varchar', length: 7, default: '#EF4444' })
  errorColor: string;

  @Column({ type: 'varchar', length: 7, default: '#F59E0B' })
  warningColor: string;

  @Column({ type: 'varchar', length: 7, default: '#10B981' })
  successColor: string;

  @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
  infoColor: string;

  // Typography
  @Column({ type: 'varchar', length: 100, default: 'Inter' })
  primaryFont: string;

  @Column({ type: 'varchar', length: 100, default: 'Inter' })
  secondaryFont: string;

  @Column({ type: 'jsonb', default: {
    h1: { size: '2.5rem', weight: '700', lineHeight: '1.2' },
    h2: { size: '2rem', weight: '600', lineHeight: '1.3' },
    h3: { size: '1.5rem', weight: '600', lineHeight: '1.4' },
    h4: { size: '1.25rem', weight: '500', lineHeight: '1.5' },
    h5: { size: '1.125rem', weight: '500', lineHeight: '1.5' },
    h6: { size: '1rem', weight: '500', lineHeight: '1.5' },
    body: { size: '1rem', weight: '400', lineHeight: '1.6' },
    small: { size: '0.875rem', weight: '400', lineHeight: '1.5' },
  }})
  typography: {
    h1: { size: string; weight: string; lineHeight: string };
    h2: { size: string; weight: string; lineHeight: string };
    h3: { size: string; weight: string; lineHeight: string };
    h4: { size: string; weight: string; lineHeight: string };
    h5: { size: string; weight: string; lineHeight: string };
    h6: { size: string; weight: string; lineHeight: string };
    body: { size: string; weight: string; lineHeight: string };
    small: { size: string; weight: string; lineHeight: string };
  };

  // Logo and Images
  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  faviconUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  heroImageUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  backgroundImageUrl: string | null;

  @Column({ type: 'jsonb', default: {
    logoWidth: 200,
    logoHeight: 60,
    faviconSize: 32,
    heroImageWidth: 1200,
    heroImageHeight: 400,
  }})
  imageDimensions: {
    logoWidth: number;
    logoHeight: number;
    faviconSize: number;
    heroImageWidth: number;
    heroImageHeight: number;
  };

  // Social Media
  @Column({ type: 'jsonb', default: {
    linkedin: null,
    twitter: null,
    facebook: null,
    instagram: null,
    youtube: null,
    github: null,
    medium: null,
  }})
  socialMedia: {
    linkedin: string | null;
    twitter: string | null;
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
    github: string | null;
    medium: string | null;
  };

  // Layout and Spacing
  @Column({ type: 'jsonb', default: {
    containerMaxWidth: '1200px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
  }})
  layout: {
    containerMaxWidth: string;
    borderRadius: string;
    boxShadow: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };

  // Custom Styling
  @Column({ type: 'text', nullable: true })
  customCSS: string | null;

  @Column({ type: 'text', nullable: true })
  customJS: string | null;

  @Column({ type: 'jsonb', default: {
    enableCustomCSS: false,
    enableCustomJS: false,
    cssVariables: {},
  }})
  customStyling: {
    enableCustomCSS: boolean;
    enableCustomJS: boolean;
    cssVariables: Record<string, string>;
  };

  // Brand Guidelines
  @Column({ type: 'jsonb', default: {
    brandVoice: 'professional',
    tone: 'friendly',
    personality: 'trustworthy',
    values: [],
    mission: null,
    vision: null,
  }})
  brandGuidelines: {
    brandVoice: 'professional' | 'casual' | 'friendly' | 'formal';
    tone: 'friendly' | 'serious' | 'playful' | 'authoritative';
    personality: 'trustworthy' | 'innovative' | 'reliable' | 'creative';
    values: string[];
    mission: string | null;
    vision: string | null;
  };

  // Document Branding
  @Column({ type: 'jsonb', default: {
    showLogo: true,
    showCompanyInfo: true,
    showContactDetails: true,
    showSocialMedia: false,
    headerStyle: 'minimal',
    footerStyle: 'minimal',
    watermark: null,
    pageNumbers: true,
  }})
  documentBranding: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    showContactDetails: boolean;
    showSocialMedia: boolean;
    headerStyle: 'minimal' | 'detailed' | 'custom';
    footerStyle: 'minimal' | 'detailed' | 'custom';
    watermark: string | null;
    pageNumbers: boolean;
  };

  // Email Branding
  @Column({ type: 'jsonb', default: {
    headerColor: '#3B82F6',
    footerColor: '#6B7280',
    buttonColor: '#10B981',
    textColor: '#374151',
    showLogo: true,
    showSocialMedia: true,
    customFooter: null,
  }})
  emailBranding: {
    headerColor: string;
    footerColor: string;
    buttonColor: string;
    textColor: string;
    showLogo: boolean;
    showSocialMedia: boolean;
    customFooter: string | null;
  };

  // Mobile Branding
  @Column({ type: 'jsonb', default: {
    appIcon: null,
    splashScreen: null,
    themeColor: '#3B82F6',
    statusBarStyle: 'light',
    enableDarkMode: true,
  }})
  mobileBranding: {
    appIcon: string | null;
    splashScreen: string | null;
    themeColor: string;
    statusBarStyle: 'light' | 'dark';
    enableDarkMode: boolean;
  };

  // Accessibility
  @Column({ type: 'jsonb', default: {
    highContrast: false,
    largeText: false,
    colorBlindFriendly: true,
    screenReaderFriendly: true,
    keyboardNavigation: true,
  }})
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    colorBlindFriendly: boolean;
    screenReaderFriendly: boolean;
    keyboardNavigation: boolean;
  };

  // Localization
  @Column({ type: 'jsonb', default: {
    supportedLanguages: ['en'],
    defaultLanguage: 'en',
    rtlSupport: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm:ss',
    currencyFormat: '$#,##0.00',
  }})
  localization: {
    supportedLanguages: string[];
    defaultLanguage: string;
    rtlSupport: boolean;
    dateFormat: string;
    timeFormat: string;
    currencyFormat: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
