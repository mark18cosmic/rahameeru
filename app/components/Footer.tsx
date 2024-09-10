import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-white rounded-lg shadow m-4 mt-10">
            <div className="w-full mx-auto max-w-screen-xl justify-center p-4 flex flex-col md:flex-row items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center">© 2024 <a href="https://mark18cosmic.github.io" className="hover:underline">Ka1sh</a>. All Rights Reserved.
                </span>
                <ul className="flex flex-wrap justify-center items-center mt-3 text-sm font-medium sm:mt-0">
                    <li>
                        <a href="/about" className="hover:underline me-4 md:me-6">About</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline">Contact</a>
                    </li>
                </ul>
            </div>
        </footer>

    )
}

export default Footer