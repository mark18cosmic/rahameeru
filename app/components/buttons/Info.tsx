import React from 'react'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@nextui-org/modal";
import { useDisclosure, Button } from '@nextui-org/react';
import { IoMdInformationCircleOutline } from "react-icons/io";

const Info = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <IoMdInformationCircleOutline onClick={onOpen} className='text-xl md:text-2xl'/>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-lg md:text-2xl">Contact Information</ModalHeader>
                            <ModalBody>
                                
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default Info