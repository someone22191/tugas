import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Users, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const majors = [
  { id: 'TKJ', name: 'Teknik Komputer Jaringan', desc: 'Mempelajari instalasi, perbaikan, dan pemeliharaan perangkat keras komputer serta jaringan.' },
  { id: 'DKV', name: 'Desain Komunikasi Visual', desc: 'Mempelajari seni visual, desain grafis, fotografi, dan videografi kreatif.' },
  { id: 'AK', name: 'Akuntansi', desc: 'Mempelajari pencatatan keuangan, perpajakan, dan administrasi bisnis profesional.' },
  { id: 'BC', name: 'Broadcasting', desc: 'Mempelajari produksi konten televisi, radio, dan media digital modern.' },
  { id: 'MPLB', name: 'Manajemen Perkantoran Layanan Bisnis', desc: 'Mempelajari tata kelola administrasi perkantoran dan pelayanan publik.' },
  { id: 'BD', name: 'Bisnis Digital', desc: 'Mempelajari strategi pemasaran online, e-commerce, dan analisis bisnis digital.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <GraduationCap className="text-white h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">SMK Prima Unggul</span>
        </div>
        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors">
          Login ke Aplikasi
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 bg-neutral-50 overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid md:grid-columns-2 items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Membangun Generasi <span className="text-primary italic">Unggul</span> & Kompeten.
            </h1>
            <p className="text-neutral-600 text-lg max-w-lg">
              SMK Prima Unggul hadir sebagai pusat keunggulan pendidikan vokasi yang membekali siswa dengan keterampilan teknologi dan kreativitas masa depan.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-neutral-200">
                <CheckCircle className="text-green-500 h-5 w-5" />
                <span className="font-medium">Terakreditasi A</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-neutral-200">
                <Users className="text-blue-500 h-5 w-5" />
                <span className="font-medium">2000+ Alumni</span>
              </div>
            </div>
            <Link to="/login" className="mt-4 flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group">
              Akses Sistem Absensi <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden md:block"
          >
             <div className="aspect-square bg-primary/10 rounded-full flex items-center justify-center p-20 border border-primary/20">
                <div className="aspect-square bg-primary/20 rounded-full w-full flex items-center justify-center p-20 border border-primary/30 rotate-12">
                   <div className="aspect-square bg-primary/40 rounded-full w-full flex items-center justify-center border border-primary/50 -rotate-24">
                      <GraduationCap className="h-40 w-40 text-primary" />
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Majors */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold uppercase tracking-widest text-sm">Program Keahlian</span>
          <h2 className="text-4xl font-bold mt-2">6 Jurusan Unggulan Kami</h2>
          <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">Kurikulum berbasis industri untuk mempersiapkan individu yang siap kerja dan berwirausaha.</p>
        </div>

        <div className="grid sm:grid-columns-2 lg:grid-columns-3 gap-8">
          {majors.map((major) => (
            <div key={major.id} className="p-8 border border-neutral-200 rounded-3xl hover:border-primary/50 transition-colors group">
              <div className="h-12 w-12 bg-neutral-100 rounded-xl flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                {major.id}
              </div>
              <h3 className="text-xl font-bold mt-6">{major.name}</h3>
              <p className="text-neutral-500 mt-2 leading-relaxed">
                {major.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary h-8 w-8" />
            <span className="font-bold text-2xl">SMK Prima Unggul</span>
          </div>
          <p className="text-neutral-400 text-sm">© 2024 SMK Prima Unggul. Semua Hak Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
