'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-transparent text-white selection:bg-primary/30 pt-24 pb-20">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[45rem] h-[45rem] bg-primary/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-8 hover:bg-white/5 text-muted-foreground hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Info Column */}
                        <div className="space-y-12">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                                    <MessageSquare className="w-3 h-3 text-primary" />
                                    Get In Touch
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] mb-8">
                                    LET'S <span className="text-primary italic underline decoration-primary decoration-8 underline-offset-8">TALK.</span>
                                </h1>
                                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-md">
                                    Have a question? Just want to say hi? We're here to help you get the most out of Comedy Connect.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Mail className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-widest text-xs">Email Us</h4>
                                    </div>
                                    <p className="text-muted-foreground">hello@comedyconnect.com</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-primary">
                                        <MapPin className="w-5 h-5" />
                                        <h4 className="font-bold uppercase tracking-widest text-xs">Location</h4>
                                    </div>
                                    <p className="text-muted-foreground">Banjara Hills, Hyderabad, TS</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Column */}
                        <div className="p-8 md:p-12 rounded-[40px] bg-neutral-900/50 border border-white/5 backdrop-blur-xl">
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Name</label>
                                        <Input placeholder="Your Name" className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary-foreground focus:ring-primary/20 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                                        <Input placeholder="your@email.com" className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary-foreground focus:ring-primary/20 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                                    <Input placeholder="What's this about?" className="h-14 bg-black/40 border-white/10 rounded-2xl focus:border-primary-foreground focus:ring-primary/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                                    <Textarea placeholder="How can we help?" className="min-h-[150px] bg-black/40 border-white/10 rounded-2xl focus:border-primary-foreground focus:ring-primary/20 transition-all py-4" />
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] italic hover:bg-white transition-all shadow-xl shadow-primary/20 group">
                                    Send Message
                                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
