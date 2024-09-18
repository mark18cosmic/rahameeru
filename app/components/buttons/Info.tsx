import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/modal";
import { useDisclosure, Button } from '@nextui-org/react';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { db } from '@/app/firebase/firebaseConfig'; // Make sure to configure Firebase and Firestore
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods

interface InfoProps {
    restaurantId: string; // Pass the restaurant ID to fetch its info
}

const Info: React.FC<InfoProps> = ({ restaurantId }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [contactInfo, setContactInfo] = useState<{ phone: string, email: string, address: string } | null>(null);

    useEffect(() => {
        // Function to fetch contact information from Firebase
        const fetchContactInfo = async () => {
            try {
                const docRef = doc(db, "restaurants", restaurantId); // Adjust the collection name and doc structure
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setContactInfo(docSnap.data() as { phone: string, email: string, address: string });
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchContactInfo();
    }, [restaurantId]);

    return (
        <>
            <IoMdInformationCircleOutline onClick={onOpen} className='text-xl md:text-2xl cursor-pointer'/>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-lg md:text-2xl">
                                Contact Information
                            </ModalHeader>
                            <ModalBody>
                                {contactInfo ? (
                                    <div className='flex flex-col gap-3 md:gap-6'>
                                        {/* Phone */}
                                        <div>
                                            <h1 className='font-medium text-sm md:text-lg'>Phone Number</h1>
                                            <p className='text-gray-600'>{contactInfo.phone}</p>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <h1 className='font-medium text-sm md:text-lg'>Email</h1>
                                            <p className='text-gray-600'>{contactInfo.email}</p>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <h1 className='font-medium text-sm md:text-lg'>Address</h1>
                                            <p className='text-gray-600'>{contactInfo.address}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='text-center'>
                                        <p>Loading contact information...</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button className="bg-root-500 text-white" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default Info;
