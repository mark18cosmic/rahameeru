'use client'

import { Button } from '@nextui-org/react'
import React, {useState} from 'react'
import { FaArrowRight } from "react-icons/fa6";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from "@nextui-org/react";
import { FaStar } from "react-icons/fa6";




const Rating = () => {
    const [rating, setRating] = useState(0);
    return (
      <>
        <div className="flex flex-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar key={star} className={`w-6 h-6 cursor-pointer ${rating >= star ? 'text-root-500' : 'text-root-100'}`}
            onClick={() => setRating(star)}/>
          ))}
        </div>
      </>
    );
}

function ReviewButton() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    return (
        <div className='md:w-full'>
            <Button className='bg-root-500 text-white md:text-large font-semibold flex flex-row items-center' onPress={onOpen}>Review <FaArrowRight /></Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement='center' backdrop='blur'>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Write a Review</ModalHeader>
                            <ModalBody>
                            <div>
                                   <label className="block text-sm font-medium text-gray-700">Rating:</label>
                                    <Rating/>
                            </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button className='bg-root-500 text-white' onPress={onClose}>
                                    Save Review
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default ReviewButton

// import React, { useState } from 'react';
// import { Modal, Button, Input, Textarea, Checkbox, Rating } from '@nextui-org/react';
// import 'tailwindcss/tailwind.css';

// const ReviewFormModal = ({ isOpen, onClose, restaurant }) => {
//     const [rating, setRating] = useState(0);
//     const [reviewTitle, setReviewTitle] = useState('');
//     const [reviewText, setReviewText] = useState('');
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [agree, setAgree] = useState(false);

//     const handleSubmit = () => {
//         // Handle form submission logic
//         console.log({ rating, reviewTitle, reviewText, name, email, agree });
//         onClose();
//     };

//     return (
//         <Modal open={isOpen} onClose={onClose} width="600px" aria-labelledby="review-form-modal">
//             <Modal.Header>
//                 <h2 className="text-lg font-semibold">Write a Review</h2>
//             </Modal.Header>
//             <Modal.Body>
//                 <div className="space-y-4">
//                     <div className="text-sm font-medium text-gray-700">
//                         <p>Restaurant: <span className="font-semibold">{restaurant.name}</span></p>
//                         <p>Location: <span className="font-semibold">{restaurant.location}</span></p>
//                     </div>
                    
                //     <div>
                //         <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating:</label>
                //         <Rating
                //             value={rating}
                //             onChange={(newRating) => setRating(newRating)}
                //             size="lg"
                //         />
                //     </div>

                //     <div>
                //         <label htmlFor="review-title" className="block text-sm font-medium text-gray-700">Review Title:</label>
                //         <Input
                //             id="review-title"
                //             type="text"
                //             value={reviewTitle}
                //             onChange={(e) => setReviewTitle(e.target.value)}
                //             placeholder="Enter a brief title for your review"
                //         />
                //     </div>

                //     <div>
                //         <label htmlFor="review-text" className="block text-sm font-medium text-gray-700">Review:</label>
                //         <Textarea
                //             id="review-text"
                //             value={reviewText}
                //             onChange={(e) => setReviewText(e.target.value)}
                //             placeholder="Write your detailed review here"
                //             rows={5}
                //         />
                //     </div>

                //     <div>
                //         <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name:</label>
                //         <Input
                //             id="name"
                //             type="text"
                //             value={name}
                //             onChange={(e) => setName(e.target.value)}
                //             placeholder="Optional"
                //         />
                //     </div>

                //     <div>
                //         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                //         <Input
                //             id="email"
                //             type="email"
                //             value={email}
                //             onChange={(e) => setEmail(e.target.value)}
                //             placeholder="Optional"
                //         />
                //     </div>

                //     <div className="flex items-center space-x-2">
                //         <Checkbox
                //             id="agree"
                //             checked={agree}
                //             onChange={(e) => setAgree(e.target.checked)}
                //         />
                //         <label htmlFor="agree" className="text-sm text-gray-600">I agree to the Terms and Conditions</label>
                //     </div>
                // </div>
//             </Modal.Body>
//             <Modal.Footer>
//                 <Button auto flat color="error" onClick={onClose}>
//                     Cancel
//                 </Button>
//                 <Button auto onClick={handleSubmit} disabled={!agree || !rating || !reviewText}>
//                     Submit Review
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default ReviewFormModal;