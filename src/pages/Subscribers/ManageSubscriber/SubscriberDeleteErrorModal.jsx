import React from 'react'
// import "./subscriberdeleteerrormodal.css";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '../../../ThemeContext';
import errors from "../../../assets/images/Modal/errorIllustration.png";
import errorsdark from "../../../assets/images/Modal/errorIllustrationdark.png"
import { X } from "lucide-react"

const SubscriberDeleteErrorModal = ({ showDeleteSubscriberErrorModal, onClose }) => {
  const { theme } = useTheme();

  if (!showDeleteSubscriberErrorModal) return null;
  return (
    <AnimatePresence>
      {showDeleteSubscriberErrorModal && (
        <motion.div
          className="add-cmy-error-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`add-cmy-error-modal ${theme === "dark" ? "dark" : "light"}`}
            style={{ maxWidth: 'calc(100vw - 40px)' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className='w-full justify-end flex'>
              <button onClick={onClose} className="add-cmy-error-deleteclosebtns">
                <X className='text-[#1C1C24] close' />
              </button>
            </div>
            <div className={`add-cmy-error-modal-content flex flex-col items-center justify-center ${theme === "dark" ? "dark" : "light"}`}>
              <img src={errors} alt="" className="w-[156px] h-[156px] errors-light" />
              <img src={errorsdark} alt="" className="w-[156px] h-[156px] errors-dark" />
              <h1 className="add-cmy-error-messegehead">An error occurred!</h1>
              <p className="add-cmy-error-messege">Please try again</p>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriberDeleteErrorModal
