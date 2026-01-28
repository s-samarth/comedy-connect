'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard, Layout, Ticket, ShieldCheck } from 'lucide-react';

export function Navbar() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { href: '/shows', label: 'Shows' },
        { href: '/comedians', label: 'Comedians' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/symbol.png"
                        alt="Comedy Connect Symbol"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-xl tracking-tight hidden sm:block">
                        Comedy <span className="text-primary">Connect</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="h-6 w-px bg-border ml-2 mr-2" />

                    {isLoading ? (
                        <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />
                    ) : isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            {user?.role?.startsWith('COMEDIAN') && (
                                <Link href="/comedian/dashboard">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <LayoutDashboard size={16} />
                                        <span>Dashboard</span>
                                    </Button>
                                </Link>
                            )}
                            {user?.role?.startsWith('ORGANIZER') && (
                                <Link href="/organizer/dashboard">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <LayoutDashboard size={16} />
                                        <span>Dashboard</span>
                                    </Button>
                                </Link>
                            )}
                            {user?.role === 'ADMIN' && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <LayoutDashboard size={16} />
                                        <span>Admin Panel</span>
                                    </Button>
                                </Link>
                            )}
                            <Link href="/bookings">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Ticket size={16} />
                                    <span>My Bookings</span>
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User size={16} />
                                    <span>Profile</span>
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                onClick={() => window.location.href = '/api/auth/signout'}
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/auth/signin">
                            <Button
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-background border-b border-border py-4 px-4 space-y-4 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-base font-medium text-muted-foreground"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-border flex flex-col gap-4">
                        {isAuthenticated ? (
                            <>
                                {user?.role?.startsWith('COMEDIAN') && (
                                    <Link href="/comedian/dashboard" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                {user?.role?.startsWith('ORGANIZER') && (
                                    <Link href="/organizer/dashboard" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                {user?.role === 'ADMIN' && (
                                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <ShieldCheck size={18} />
                                            Admin Panel
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/bookings" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Ticket size={18} />
                                        My Bookings
                                    </Button>
                                </Link>
                                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <User size={18} />
                                        Profile
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-primary text-primary"
                                    onClick={() => window.location.href = '/api/auth/signout'}
                                >
                                    <LogOut size={18} className="mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                                <Button
                                    className="w-full bg-primary text-primary-foreground"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
