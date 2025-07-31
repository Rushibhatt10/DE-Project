// utils/sendEmail.js
import emailjs from '@emailjs/browser';

export const sendConfirmationEmail = (formData) => {
  const serviceId = 'service_hsrbila'; 
  const templateId = 'template_eiv8arm';
  const publicKey = 'OURe-LROKrYp6YWb_';

  const templateParams = {
    to_name: formData.userName,
    from_name: 'Your App Name',
    message: `Your request for ${formData.serviceName} has been received.`,
    reply_to: formData.userEmail,
  };

  return emailjs.send(serviceId, templateId, templateParams, publicKey);
};
