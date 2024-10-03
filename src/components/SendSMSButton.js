import React, { useState } from 'react';
import { FaSpinner, FaCheck } from 'react-icons/fa';

const SendSMSButton = () => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendSMS = async () => {
    if (!recipient || !content) {
      setError('Please provide both recipient phone number and content.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/sendSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient,
          content,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('SMS sent successfully!');
      } else {
        setError(result.error || 'Failed to send SMS.');
      }
    } catch (err) {
      setError('An error occurred while sending SMS.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sms-form">
      <h2 className="text-xl font-bold mb-4">Send an SMS</h2>
      <div className="mb-4">
        <label className="block text-white mb-2">Recipient Phone Number:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient's phone number"
          className="input-field"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2">Message Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter the SMS content"
          className="input-field"
        />
      </div>
      <button
        onClick={handleSendSMS}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {loading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <FaCheck className="mr-2" />
        )}
        {loading ? 'Sending...' : 'Send SMS'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  );
};

export default SendSMSButton;
