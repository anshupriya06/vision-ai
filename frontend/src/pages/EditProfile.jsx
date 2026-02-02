import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import API_BASE from '../config/api';

const EditProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    displayName: '',
    email: '',
    mobileNumber: '',
    photoURL: '',
    bio: ''
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!currentUser?.email) {
          setLoading(false);
          return;
        }
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_BASE}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-Email': currentUser.email
          }
        });
        if (response.ok) {
          const data = await response.json();
          const profile = data.profile || {};
          const displayName = profile.display_name || currentUser.displayName || '';
          const photoURL = profile.photo_url || currentUser.photoURL || '';
          const mobileNumber = profile.mobile_number || '';
          const bio = profile.bio || '';

          setFormValues({
            displayName,
            email: currentUser.email,
            mobileNumber,
            photoURL,
            bio
          });
          setPhotoPreview(photoURL);
        } else {
          setFormValues({
            displayName: currentUser.displayName || '',
            email: currentUser.email,
            mobileNumber: '',
            photoURL: currentUser.photoURL || '',
            bio: ''
          });
          setPhotoPreview(currentUser.photoURL || '');
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser?.email, currentUser?.displayName, currentUser?.photoURL]);

  const validation = useMemo(() => {
    const errors = {};
    if (!formValues.displayName.trim()) {
      errors.displayName = 'Name is required.';
    }
    if (formValues.mobileNumber) {
      const digitsOnly = formValues.mobileNumber.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        errors.mobileNumber = 'Mobile number should be 7-15 digits.';
      }
    }
    if (formValues.bio && formValues.bio.length > 240) {
      errors.bio = 'Bio must be under 240 characters.';
    }
    return errors;
  }, [formValues.displayName, formValues.mobileNumber, formValues.bio]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || '';
      setPhotoPreview(result);
      setFormValues((prev) => ({
        ...prev,
        photoURL: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setShowToast(false);
      if (Object.keys(validation).length > 0) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      setSaving(true);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formValues.displayName,
          photoURL: formValues.photoURL || auth.currentUser.photoURL || ''
        });
      }

      if (currentUser?.email) {
        const token = await currentUser.getIdToken();
        await axios.post(
          `${API_BASE}/user/update-profile`,
          {
            mobile_number: formValues.mobileNumber,
            bio: formValues.bio
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-User-Email': currentUser.email
            }
          }
        );
      }

      setSuccess('Profile updated successfully.');
      setShowToast(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-5xl mx-auto glassmorphism p-10 rounded-2xl text-center text-gray-400">
          Loading profile editor...
        </div>
      </section>
    );
  }

  return (
    <section id="profile-edit" className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {showToast && (
          <div className="fixed top-6 right-6 z-50 bg-safe/20 border border-safe/50 text-safe px-4 py-3 rounded-xl shadow-lg animate-fade-in">
            {success || 'Profile updated successfully.'}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient">Edit Profile</h1>
            <p className="text-gray-400 mt-2">Keep your personal details up to date</p>
          </div>
          <button
            onClick={handleCancel}
            className="px-5 py-3 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-accent transition-all"
          >
            Back to Profile
          </button>
        </div>

        <div className="glassmorphism p-8 rounded-2xl mb-8 transition-all hover:shadow-xl hover:shadow-accent/10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-1/3">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-accent rounded-full blur opacity-30"></div>
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="relative w-32 h-32 rounded-full border-2 border-accent object-cover" />
                ) : (
                  <div className="relative w-32 h-32 rounded-full border-2 border-accent bg-accent/20 flex items-center justify-center text-white text-3xl font-bold">
                    {(formValues.displayName || formValues.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="mt-4 inline-block text-sm text-gray-300">
                <span className="block mb-2">Profile image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent/20 file:text-accent file:font-semibold hover:file:bg-accent/30"
                />
              </label>
            </div>

            <div className="flex-1 space-y-5">
              {error && (
                <div className="bg-unsafe/20 border border-unsafe/50 text-unsafe rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="text-gray-300 text-sm">Full Name</label>
                <input
                  name="displayName"
                  value={formValues.displayName}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-3 bg-slate-900/60 border border-accent/30 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter your full name"
                />
                {validation.displayName && (
                  <p className="text-unsafe text-sm mt-1">{validation.displayName}</p>
                )}
              </div>

              <div>
                <label className="text-gray-300 text-sm">Email</label>
                <input
                  name="email"
                  value={formValues.email}
                  readOnly
                  className="mt-2 w-full px-4 py-3 bg-slate-900/40 border border-white/10 rounded-lg text-gray-400"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Mobile Number</label>
                <input
                  name="mobileNumber"
                  value={formValues.mobileNumber}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-3 bg-slate-900/60 border border-accent/30 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="Add a phone number"
                />
                {validation.mobileNumber && (
                  <p className="text-unsafe text-sm mt-1">{validation.mobileNumber}</p>
                )}
              </div>

              <div>
                <label className="text-gray-300 text-sm">Bio</label>
                <textarea
                  name="bio"
                  value={formValues.bio}
                  onChange={handleChange}
                  rows="4"
                  className="mt-2 w-full px-4 py-3 bg-slate-900/60 border border-accent/30 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                  placeholder="Write a short bio"
                />
                {validation.bio && (
                  <p className="text-unsafe text-sm mt-1">{validation.bio}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && (
                    <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-800 border border-accent/30 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-accent transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditProfile;
