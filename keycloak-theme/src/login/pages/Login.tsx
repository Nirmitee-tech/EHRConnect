import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext } = props;

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    return (
        <div className="ehr-split-container">
            {/* Left Panel - Healthcare Branding */}
            <div className="ehr-left-panel">
                <div className="ehr-logo">
                    <svg className="ehr-logo-icon" viewBox="0 0 48 48" width="40" height="40">
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#60A5FA', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                            </linearGradient>
                        </defs>
                        <rect x="6" y="6" width="36" height="36" rx="8" fill="url(#logoGradient)" />
                        <path d="M 24 14 L 24 34 M 14 24 L 34 24" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="24" cy="24" r="3" fill="white" />
                    </svg>
                    <span className="ehr-logo-text">
                        <span className="ehr-logo-primary">EHR</span>
                        <span className="ehr-logo-secondary">Connect</span>
                    </span>
                </div>

                <div className="ehr-illustration">
                    <svg viewBox="0 0 500 400" className="ehr-doctors-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="doctorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: '#60A5FA', stopOpacity: 0.9}} />
                                <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0.95}} />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* Background elements */}
                        <circle cx="120" cy="80" r="40" fill="rgba(255,255,255,0.1)" className="float-animation" />
                        <circle cx="380" cy="100" r="30" fill="rgba(255,255,255,0.08)" className="float-animation-delayed" />
                        <circle cx="450" cy="300" r="45" fill="rgba(255,255,255,0.09)" className="float-animation" />
                        
                        {/* Medical cross icons */}
                        <g opacity="0.15">
                            <path d="M 80 150 L 80 180 M 65 165 L 95 165" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            <path d="M 420 250 L 420 280 M 405 265 L 435 265" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </g>
                        
                        {/* Doctor 1 - Professional with stethoscope */}
                        <g className="doctor-left">
                            {/* Shadow */}
                            <ellipse cx="160" cy="360" rx="55" ry="10" fill="rgba(0,0,0,0.15)" />
                            
                            {/* Lab coat */}
                            <path d="M 140 220 Q 135 240 140 280 L 140 350 Q 140 360 150 360 L 170 360 Q 180 360 180 350 L 180 280 Q 185 240 180 220" 
                                  fill="url(#doctorGradient)" stroke="#2563EB" strokeWidth="1"/>
                            
                            {/* Body */}
                            <rect x="145" y="220" width="30" height="50" fill="#60A5FA" rx="5" />
                            
                            {/* Collar */}
                            <path d="M 150 220 L 145 235 M 170 220 L 175 235" stroke="white" strokeWidth="2" />
                            
                            {/* Head */}
                            <circle cx="160" cy="200" r="25" fill="#DBEAFE" />
                            
                            {/* Hair */}
                            <path d="M 135 200 Q 135 175 160 175 Q 185 175 185 200" fill="#1E40AF" />
                            
                            {/* Face features */}
                            <circle cx="152" cy="198" r="2.5" fill="#1E40AF" />
                            <circle cx="168" cy="198" r="2.5" fill="#1E40AF" />
                            <path d="M 155 208 Q 160 212 165 208" stroke="#1E40AF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            
                            {/* Stethoscope */}
                            <path d="M 145 240 Q 130 250 130 270 L 130 290" stroke="#1E40AF" strokeWidth="3" fill="none" />
                            <circle cx="130" cy="295" r="8" fill="none" stroke="#1E40AF" strokeWidth="3" />
                            <circle cx="130" cy="295" r="5" fill="#60A5FA" />
                            
                            {/* Arm with clipboard */}
                            <path d="M 180 240 L 200 260" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" />
                            <rect x="195" y="260" width="18" height="30" rx="2" fill="white" stroke="#2563EB" strokeWidth="2" />
                            <line x1="199" y1="267" x2="209" y2="267" stroke="#2563EB" strokeWidth="1.5" />
                            <line x1="199" y1="273" x2="209" y2="273" stroke="#2563EB" strokeWidth="1.5" />
                            <line x1="199" y1="279" x2="209" y2="279" stroke="#2563EB" strokeWidth="1.5" />
                        </g>
                        
                        {/* Doctor 2 - Professional with medical symbol */}
                        <g className="doctor-right">
                            {/* Shadow */}
                            <ellipse cx="340" cy="360" rx="55" ry="10" fill="rgba(0,0,0,0.15)" />
                            
                            {/* Lab coat */}
                            <path d="M 320 220 Q 315 240 320 280 L 320 350 Q 320 360 330 360 L 350 360 Q 360 360 360 350 L 360 280 Q 365 240 360 220" 
                                  fill="url(#doctorGradient)" stroke="#2563EB" strokeWidth="1"/>
                            
                            {/* Body */}
                            <rect x="325" y="220" width="30" height="50" fill="#60A5FA" rx="5" />
                            
                            {/* Collar */}
                            <path d="M 330 220 L 325 235 M 350 220 L 355 235" stroke="white" strokeWidth="2" />
                            
                            {/* Head */}
                            <circle cx="340" cy="200" r="25" fill="#DBEAFE" />
                            
                            {/* Hair */}
                            <path d="M 315 200 Q 315 175 340 175 Q 365 175 365 200" fill="#1E40AF" />
                            
                            {/* Glasses */}
                            <g stroke="#1E40AF" strokeWidth="2" fill="none">
                                <circle cx="332" cy="198" r="6" />
                                <circle cx="348" cy="198" r="6" />
                                <line x1="338" y1="198" x2="342" y2="198" />
                            </g>
                            
                            {/* Smile */}
                            <path d="M 333 208 Q 340 213 347 208" stroke="#1E40AF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            
                            {/* Medical cross badge */}
                            <g transform="translate(335, 245)">
                                <rect width="10" height="10" rx="2" fill="white" />
                                <path d="M 5 2 L 5 8 M 2 5 L 8 5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                            </g>
                            
                            {/* Arm gesture */}
                            <path d="M 360 240 L 380 250 Q 385 255 380 260" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" />
                        </g>
                        
                        {/* Floating medical icons */}
                        <g opacity="0.3" className="pulse-animation">
                            <circle cx="100" cy="280" r="15" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M 100 270 L 100 290 M 90 280 L 110 280" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </g>
                        
                        <g opacity="0.3" className="pulse-animation-delayed">
                            <circle cx="400" cy="180" r="18" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M 392 180 L 398 186 L 408 176" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </g>
                    </svg>
                </div>

                <div className="ehr-content">
                    <div className="ehr-badge">Next-Gen Healthcare Platform</div>
                    <h2 className="ehr-headline">Transform Healthcare Delivery</h2>
                    <p className="ehr-description">
                        Enterprise-grade Electronic Health Records system. Seamlessly manage patient care, streamline clinical workflows, and enhance care coordination with FHIR-compliant data exchange.
                    </p>
                    <div className="ehr-features">
                        <div className="ehr-feature">
                            <svg className="ehr-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Real-time Sync</span>
                        </div>
                        <div className="ehr-feature">
                            <svg className="ehr-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="ehr-feature">
                            <svg className="ehr-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span>FHIR Compatible</span>
                        </div>
                    </div>
                </div>

                <div className="ehr-carousel-indicators">
                    <span className="ehr-indicator active"></span>
                    <span className="ehr-indicator"></span>
                    <span className="ehr-indicator"></span>
                    <span className="ehr-indicator"></span>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="ehr-right-panel">
                <div className="ehr-form-container">
                    <div className="ehr-form-header">
                        <h1 className="ehr-form-title">Login to your account</h1>
                        <p className="ehr-form-subtitle">
                            Login to access your healthcare dashboard. Explore appointments, manage tasks and patient
                            records with ease.
                        </p>
                    </div>

                    <div id="kc-form">
                        <div id="kc-form-wrapper">
                            {realm.password && (
                                <form
                                    id="kc-form-login"
                                    onSubmit={() => {
                                        setIsLoginButtonDisabled(true);
                                        return true;
                                    }}
                                    action={url.loginAction}
                                    method="post"
                                >
                                    {!usernameHidden && (
                                        <div className="ehr-form-group">
                                            <label htmlFor="username" className="ehr-label">
                                                Email
                                            </label>
                                            <div className="ehr-input-wrapper">
                                                <svg className="ehr-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <input
                                                    tabIndex={2}
                                                    id="username"
                                                    className="ehr-input"
                                                    name="username"
                                                    defaultValue={login.username ?? ""}
                                                    type="text"
                                                    autoFocus
                                                    autoComplete="username"
                                                    placeholder="Enter your email address"
                                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                                />
                                            </div>
                                            {messagesPerField.existsError("username", "password") && (
                                                <span
                                                    id="input-error"
                                                    className="ehr-error"
                                                    aria-live="polite"
                                                >
                                                    {messagesPerField.getFirstError("username", "password")}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="ehr-form-group">
                                        <label htmlFor="password" className="ehr-label">
                                            Password
                                        </label>
                                        <div className="ehr-input-wrapper">
                                            <svg className="ehr-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <input
                                                tabIndex={3}
                                                id="password"
                                                className="ehr-input"
                                                name="password"
                                                type="password"
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                aria-invalid={messagesPerField.existsError("username", "password")}
                                            />
                                        </div>
                                    </div>

                                    <div className="ehr-form-options">
                                        <div className="ehr-checkbox-wrapper">
                                            {realm.rememberMe && !usernameHidden && (
                                                <label className="ehr-checkbox-label">
                                                    <input
                                                        tabIndex={5}
                                                        id="rememberMe"
                                                        name="rememberMe"
                                                        type="checkbox"
                                                        defaultChecked={!!login.rememberMe}
                                                        className="ehr-checkbox"
                                                    />
                                                    <span>Remember Me</span>
                                                </label>
                                            )}
                                        </div>
                                        {realm.resetPasswordAllowed && (
                                            <a tabIndex={6} href={url.loginResetCredentialsUrl} className="ehr-link">
                                                Forgot your password?
                                            </a>
                                        )}
                                    </div>

                                    <div id="kc-form-buttons" className="ehr-form-buttons">
                                        <input
                                            type="hidden"
                                            id="id-hidden-input"
                                            name="credentialId"
                                            value={auth.selectedCredential}
                                        />
                                        <button
                                            tabIndex={7}
                                            className="ehr-btn-primary"
                                            name="login"
                                            id="kc-login"
                                            type="submit"
                                            disabled={isLoginButtonDisabled}
                                        >
                                            Login
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                            <div id="kc-social-providers" className="ehr-social-section">
                                <p className="ehr-social-text">Or connect with a social account</p>
                                <div className="ehr-social-buttons">
                                    {social.providers.map(p => (
                                        <a
                                            key={p.providerId}
                                            id={`social-${p.alias}`}
                                            className="ehr-social-btn"
                                            type="button"
                                            href={p.loginUrl}
                                        >
                                            {p.iconClasses && (
                                                <i className={clsx(p.iconClasses)} aria-hidden="true"></i>
                                            )}
                                            <span>{p.displayName}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {realm.password && realm.registrationAllowed && !registrationDisabled && (
                            <div id="kc-registration" className="ehr-registration">
                                <span>
                                    Don't have an account yet?{" "}
                                    <a tabIndex={8} href={url.registrationUrl} className="ehr-link-primary">
                                        Signup
                                    </a>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
