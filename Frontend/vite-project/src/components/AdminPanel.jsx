import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { useState } from 'react';

/* ================= ZOD SCHEMA (MATCHES MONGOOSE) ================= */

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedlist', 'graph', 'dp', 'string']),

  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explaination: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case is required'),

  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case is required'),

  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three language templates are required'),

  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three language solutions are required')
});

/* ================= COMPONENT ================= */

function AdminPanel() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'medium',
      tags: 'array',
      visibleTestCases: [{ input: '', output: '', explaination: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '// C++ starter code\n\n' },
        { language: 'Java', initialCode: '// Java starter code\n\n' },
        { language: 'JavaScript', initialCode: '// JavaScript starter code\n\n' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '// C++ solution\n\n' },
        { language: 'Java', completeCode: '// Java solution\n\n' },
        { language: 'JavaScript', completeCode: '// JavaScript solution\n\n' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      console.log('🔄 Submitting problem with data:', data);
      
      const response = await axiosClient.post('/problem/create', data);
      
      console.log('✅ Problem created successfully:', response.data);
      setSubmitSuccess(true);
      
      // Show success message for 2 seconds before navigating
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create problem';
      
      console.error('❌ Error creating problem:', {
        message: errorMessage,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setSubmitError(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render error messages
  const renderError = (fieldPath) => {
    const fieldError = errors[fieldPath] || 
                      errors.visibleTestCases?.[fieldPath] ||
                      errors.hiddenTestCases?.[fieldPath] ||
                      errors.startCode?.[fieldPath] ||
                      errors.referenceSolution?.[fieldPath];
    
    return fieldError ? (
      <span className="text-error text-sm mt-1 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {fieldError.message}
      </span>
    ) : null;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create New Problem</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to create a new coding challenge</p>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="alert alert-success shadow-lg mb-6 animate-fadeIn">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Problem created successfully! Redirecting...</span>
          </div>
        </div>
      )}

      {submitError && (
        <div className="alert alert-error shadow-lg mb-6 animate-fadeIn">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error: {submitError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* ================= BASIC INFO ================= */}
        <div className="card bg-white shadow-xl p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Problem Title*</span>
              </label>
              <input
                {...register('title')}
                placeholder="e.g., Two Sum"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
              />
              {renderError('title')}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Description*</span>
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe the problem in detail..."
                rows="4"
                className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
              />
              {renderError('description')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Difficulty*</span>
                </label>
                <select {...register('difficulty')} className="select select-bordered w-full">
                  <option value="easy" className="text-success">Easy</option>
                  <option value="medium" className="text-warning">Medium</option>
                  <option value="hard" className="text-error">Hard</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Category*</span>
                </label>
                <select {...register('tags')} className="select select-bordered w-full">
                  <option value="array">Array</option>
                  <option value="linkedlist">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                  <option value="string">String</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ================= VISIBLE TEST CASES ================= */}
        <div className="card bg-white shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-info/10 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Visible Test Cases</h2>
            </div>
            <span className="badge badge-info">{visibleFields.length} cases</span>
          </div>

          {errors.visibleTestCases && (
            <div className="alert alert-warning mb-4">
              <span>{errors.visibleTestCases.message}</span>
            </div>
          )}

          <div className="space-y-4">
            {visibleFields.map((field, index) => (
              <div key={field.id} className="card bg-base-100 border border-gray-300 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Test Case #{index + 1}</h3>
                  {visibleFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-error btn-sm btn-outline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="label">
                      <span className="label-text">Input*</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.input`)}
                      placeholder="e.g., [2,7,11,15], 9"
                      rows="2"
                      className="textarea textarea-bordered w-full font-mono"
                    />
                    {renderError(`visibleTestCases.${index}.input`)}
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Output*</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.output`)}
                      placeholder="e.g., [0,1]"
                      rows="2"
                      className="textarea textarea-bordered w-full font-mono"
                    />
                    {renderError(`visibleTestCases.${index}.output`)}
                  </div>
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Explanation*</span>
                  </label>
                  <textarea
                    {...register(`visibleTestCases.${index}.explaination`)}
                    placeholder="Explain why this input produces this output..."
                    rows="2"
                    className="textarea textarea-bordered w-full"
                  />
                  {renderError(`visibleTestCases.${index}.explaination`)}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => appendVisible({ input: '', output: '', explaination: '' })}
            className="btn btn-outline btn-primary mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Add Visible Test Case
          </button>
        </div>

        {/* ================= HIDDEN TEST CASES ================= */}
        <div className="card bg-white shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-warning/10 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Hidden Test Cases</h2>
            </div>
            <span className="badge badge-warning">{hiddenFields.length} cases</span>
          </div>

          {errors.hiddenTestCases && (
            <div className="alert alert-warning mb-4">
              <span>{errors.hiddenTestCases.message}</span>
            </div>
          )}

          <div className="space-y-4">
            {hiddenFields.map((field, index) => (
              <div key={field.id} className="card bg-base-100 border border-gray-300 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Hidden Test Case #{index + 1}</h3>
                  {hiddenFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-error btn-sm btn-outline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label">
                      <span className="label-text">Input*</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="Hidden input value"
                      rows="2"
                      className="textarea textarea-bordered w-full font-mono"
                    />
                    {renderError(`hiddenTestCases.${index}.input`)}
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Output*</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="Expected output"
                      rows="2"
                      className="textarea textarea-bordered w-full font-mono"
                    />
                    {renderError(`hiddenTestCases.${index}.output`)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => appendHidden({ input: '', output: '' })}
            className="btn btn-outline btn-warning mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Add Hidden Test Case
          </button>
        </div>

        {/* ================= CODE TEMPLATES ================= */}
        <div className="card bg-white shadow-xl p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-secondary/10 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Code Templates & Solutions</h2>
          </div>

          <div className="tabs tabs-boxed mb-6">
            {['C++', 'Java', 'JavaScript'].map((lang, index) => (
              <a key={lang} className={`tab ${index === 0 ? 'tab-active' : ''}`}>
                {lang}
              </a>
            ))}
          </div>

          {errors.startCode && (
            <div className="alert alert-warning mb-4">
              <span>{errors.startCode.message}</span>
            </div>
          )}

          {errors.referenceSolution && (
            <div className="alert alert-warning mb-4">
              <span>{errors.referenceSolution.message}</span>
            </div>
          )}

          <div className="space-y-8">
            {[0, 1, 2].map((index) => {
              const lang = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
              const languageColor = {
                'C++': 'badge-secondary',
                'Java': 'badge-warning',
                'JavaScript': 'badge-info'
              }[lang];

              return (
                <div key={index} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <span className={`badge ${languageColor} mr-2`}>{lang}</span>
                    <h3 className="font-semibold">Language: {lang}</h3>
                  </div>

                  <input
                    type="hidden"
                    {...register(`startCode.${index}.language`)}
                    value={lang}
                  />
                  <input
                    type="hidden"
                    {...register(`referenceSolution.${index}.language`)}
                    value={lang}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Starter Template*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          placeholder={`Enter ${lang} starter code...`}
                          rows="10"
                          className="textarea textarea-bordered w-full font-mono text-sm"
                          spellCheck="false"
                        />
                        {renderError(`startCode.${index}.initialCode`)}
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Reference Solution*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          placeholder={`Enter ${lang} complete solution...`}
                          rows="10"
                          className="textarea textarea-bordered w-full font-mono text-sm"
                          spellCheck="false"
                        />
                        {renderError(`referenceSolution.${index}.completeCode`)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= SUBMIT BUTTON ================= */}
        <div className="sticky bottom-0 bg-base-100 pt-4 pb-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              All fields marked with * are required
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Create Problem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminPanel;