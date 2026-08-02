import { Aperture, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Footer() { return <footer className="site-footer"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-10"><div className="footer-top"><div><p className="footer-kicker">THE ROLL KEEPS TURNING</p><h2>Made for<br /><i>looking closer.</i></h2></div><Link href="/contact" className="footer-link">Start a conversation <ArrowUpRight size={19} /></Link></div><div className="footer-bottom"><span className="brand"><span className="brand-mark"><Aperture size={17} /></span>CLICKS</span><span>© {new Date().getFullYear()} · ABHINAV KUMAR</span><span>SHOT WITH FUJIFILM</span></div></div></footer>; }
