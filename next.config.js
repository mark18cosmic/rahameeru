// const withPWA = require('next-pwa')({
//   dest: 'public'
// })
module.exports = ({
    images: {
      domains: ['image.winudf.com', 'upload.wikimedia.org', 'imgs.search.brave.com', 'brandslogos.com', 'images.pexels.com', 'scontent.fmle2-2.fna.fbcdn.net'],
      unoptimized: true 
    },
    output: 'export',
    // pwa: {
    //   dest: 'public',
    //   disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
    // },
  })