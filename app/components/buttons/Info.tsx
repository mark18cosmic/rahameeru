'use client';

import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/modal";
import { useDisclosure, Button } from '@nextui-org/react';
import { IoMdInformationCircleOutline } from "react-icons/io";

interface InfoProps {
    phone: string;
    email: string;
}

const Info: React.FC<InfoProps> = ({ phone, email }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <IoMdInformationCircleOutline onClick={onOpen} className='text-2xl md:text-3xl cursor-pointer'/>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-lg md:text-2xl">
                                Contact Information
                            </ModalHeader>
                            <ModalBody>
                                <div className='flex flex-col gap-3 md:gap-6'>
                                    {/* Phone */}
                                    <div>
                                        <h1 className='font-medium text-sm md:text-lg'>Phone Number</h1>
                                        <p className='text-gray-600'>{phone}</p>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <h1 className='font-medium text-sm md:text-lg'>Email</h1>
                                        <p className='text-gray-600'>{email}</p>
                                    </div>
                                </div>
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
