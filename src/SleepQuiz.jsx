import React, { useState } from 'react';
import { supabase } from './supabaseClient';

// Quiz sections for visual organization
const sections = [
  { id: 'about', name: 'About You', questions: [0, 1, 2] },
  { id: 'routine', name: 'Sleep Routine', questions: [3, 4, 5] },
  { id: 'patterns', name: 'Sleep Patterns', questions: [6, 7, 8] },
  { id: 'lifestyle', name: 'Lifestyle Assessment', questions: [9, 10, 11, 12] }
];

const questions = [
  {
    id: 'bedtime_variability',
    question: 'Do your bedtimes vary from day to day?',
    options: [
      { text: 'I sleep and wake at the same time every day', flags: [] },
      { text: 'Slight variation (±1 hour)', flags: [] },
      { text: 'Very different each night', flags: ['circadian_irregularity'] }
    ]
  },
  {
    id: 'weekend_shift',
    question: 'On weekends, how different is your sleep schedule?',
    options: [
      { text: 'Same as weekdays', flags: [] },
      { text: '30–60 mins different', flags: [] },
      { text: '1–2 hours different', flags: ['has_social_jetlag'] },
      { text: 'Over 2 hours different', flags: ['has_social_jetlag'] }
    ]
  },
  {
    id: 'thermoregulation',
    question: 'Do you often wake up feeling too hot or sweating?',
    options: [
      { text: 'Never', flags: [] },
      { text: 'Sometimes', flags: [] },
      { text: 'Often', flags: ['thermoregulation_disruption'] },
      { text: 'Most nights', flags: ['thermoregulation_disruption'] }
    ]
  },
  {
    id: 'wind_down',
    question: 'Do you follow a regular wind-down routine before bed?',
    options: [
      { text: 'Yes, consistently', flags: [] },
      { text: 'Sometimes', flags: [] },
      { text: 'No routine at all', flags: ['no_pre_sleep_routine'] }
    ]
  },
  {
    id: 'shared_bed',
    question: 'Do you share your bed with anyone or anything?',
    options: [
      { text: 'No', flags: [] },
      { text: 'Yes, a partner or pet', flags: ['partner_or_child_disruption'] },
      { text: 'Yes, a child or baby', flags: ['partner_or_child_disruption'] }
    ]
  },
  {
    id: 'snoring',
    question: 'Do you snore, or has someone told you that you snore?',
    options: [
      { text: 'No', flags: [] },
      { text: 'Occasionally', flags: [] },
      { text: 'Yes, frequently', flags: ['possible_sleep_apnea'] }
    ]
  },
  {
    id: 'sleep_goal',
    question: 'What brings you here today?',
    options: [
      { text: 'I have trouble falling asleep', flags: ['restless_mind'] },
      { text: 'I wake up tired', flags: ['shallow_sleeper'] },
      { text: 'I want to optimize my sleep', flags: ['bio_optimizer'] },
      { text: 'I have an irregular schedule', flags: ['circadian_irregularity'] }
    ]
  },
  {
    id: 'sleep_duration',
    question: 'How many hours do you usually sleep per night?',
    options: [
      { text: '< 5 hours', flags: ['sleeps_less_than_5_hours'] },
      { text: '5–6 hours', flags: ['weeknight_undersleeping'] },
      { text: '7–8 hours', flags: [] },
      { text: 'More than 8 hours', flags: [] }
    ]
  },
  {
    id: 'wake_feeling',
    question: 'How do you feel when you wake up in the morning?',
    options: [
      { text: 'Refreshed and alert', flags: [] },
      { text: 'Somewhat tired', flags: [] },
      { text: 'Still tired despite sleeping enough', flags: ['wakes_up_tired'] },
      { text: 'Exhausted or foggy-headed', flags: ['wakes_up_tired'] }
    ]
  },
  {
    id: 'night_awakenings',
    question: 'Do you wake up in the middle of the night?',
    options: [
      { text: 'Rarely', flags: [] },
      { text: 'Once in a while', flags: [] },
      { text: 'Almost every night', flags: ['night_awakening'] },
      { text: 'Multiple times every night', flags: ['night_awakening'] }
    ]
  },
  {
    id: 'stress_level',
    question: 'How would you rate your stress levels at night?',
    options: [
      { text: 'Low (1–2)', flags: [] },
      { text: 'Moderate (3)', flags: [] },
      { text: 'High (4–5)', flags: ['has_high_stress'] }
    ]
  },
  {
    id: 'screen_use',
    question: 'How often do you use screens in the hour before bed?',
    options: [
      { text: 'Never', flags: [] },
      { text: 'Sometimes', flags: ['uses_screen_before_bed'] },
      { text: 'Often', flags: ['uses_screen_before_bed'] },
      { text: 'Always', flags: ['uses_screen_before_bed'] }
    ]
  },
  {
    id: 'alcohol_use',
    question: 'How many nights per week do you have alcohol before bed?',
    options: [
      { text: '0', flags: [] },
      { text: '1', flags: [] },
      { text: '2', flags: ['uses_alcohol_before_bed'] },
      { text: '3+', flags: ['uses_alcohol_before_bed'] }
    ]
  }
];

export default function SleepQuiz() {
  const [step, setStep] = useState(-1);
  const [flags, setFlags] = useState([]);
  const [responses, setResponses] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Detect if mobile
  const isMobile = window.innerWidth <= 768;

  // Get current section info
  const getCurrentSection = () => {
    for (let section of sections) {
      if (section.questions.includes(step)) {
        return section;
      }
    }
    return null;
  };

  const getSectionProgress = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    const completedQuestions = section.questions.filter(qIndex => 
      questions[qIndex] && responses[questions[qIndex].id]
    ).length;
    
    return (completedQuestions / section.questions.length) * 100;
  };

  const handleAnswer = (option) => {
    const currentQuestion = questions[step];
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: option.text
    }));
    
    console.log('Answer selected:', option.text, 'Flags:', option.flags);
    setFlags(prevFlags => [...prevFlags, ...option.flags]);
    
    setStep(step + 1);
  };

  const submitToBackend = async (data) => {
  try {
    const { data: insertData, error } = await supabase.from('quiz_responses').insert([
      {
        name: data.name,
        email: data.email,
        age: data.age,
        gender: data.gender,
        responses: JSON.stringify(data.responses),
        flags: data.flags,
        completed_at: data.completed_at,
        quiz_version: data.quiz_version
      }
    ]);

    if (error) {
      console.error('❌ Supabase error:', error.message);
      throw error;
    }

    console.log('✅ Submitted to Supabase:', insertData);
  } catch (error) {
    console.error("❌ Failed to submit quiz data:", error);
    throw error;
  }
};


  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Please fill in your name and email');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = { 
        name, email, age, gender, responses,
        flags: flags.filter(flag => flag),
        completed_at: new Date().toISOString(),
        quiz_version: '1.0'
      };
      
      await submitToBackend(data);
      setShowResult(true);
    } catch (error) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#FAF8F3',
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: isMobile ? '8px' : '20px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? '16px' : '24px',
    boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.08)' : '0 20px 60px rgba(0,0,0,0.1)',
    padding: isMobile ? '20px 16px' : '60px 40px',
    width: '100%',
    maxWidth: isMobile ? 'none' : '1200px',
    margin: '0 auto',
    minHeight: isMobile ? 'calc(100vh - 16px)' : 'auto'
  };

  // Intro screen
  if (step === -1) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{
            backgroundColor: '#223875',
            color: 'white',
            padding: isMobile ? '16px' : '20px 40px',
            borderRadius: isMobile ? '12px' : '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: isMobile ? '20px' : '30px'
          }}>
            <img 
              src="/sloom-logo.png" 
              alt="Sloom Logo" 
              style={{
                height: isMobile ? '32px' : '48px',
                filter: 'brightness(0) invert(1)'
              }}
            />
            <p style={{
              margin: 0,
              fontSize: isMobile ? '13px' : '16px',
              opacity: 0.9,
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              This sleep assessment is co-created with sleep experts
            </p>
          </div>

          {/* Section Navigation */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '8px' : '16px',
            width: '100%',
            marginBottom: isMobile ? '20px' : '30px'
          }}>
            {sections.map((section, index) => (
              <div
                key={section.id}
                style={{
                  backgroundColor: index === 0 ? '#FF8C94' : '#E8E9EA',
                  color: index === 0 ? 'white' : '#666',
                  padding: isMobile ? '12px 8px' : '20px 16px',
                  borderRadius: isMobile ? '12px' : '16px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '4px',
                  minHeight: isMobile ? '60px' : 'auto'
                }}
              >
                <div>{section.name}</div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  opacity: 0.8
                }}>
                  {Math.round(getSectionProgress(section.id))}%
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <h2 style={{
            fontSize: isMobile ? '20px' : '28px',
            color: '#333',
            margin: '20px 0',
            fontWeight: '600',
            lineHeight: '1.3',
            textAlign: 'center'
          }}>
            Before we start, can we get your name?
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '16px 20px',
                fontSize: '16px',
                border: 'none',
                borderBottom: '3px solid #FF8C94',
                backgroundColor: 'transparent',
                outline: 'none',
                textAlign: 'center',
                color: '#333',
                display: 'block',
                margin: '0 auto',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setStep(0)}
              disabled={!name.trim()}
              style={{
                backgroundColor: !name.trim() ? '#ccc' : '#223875',
                color: 'white',
                border: 'none',
                padding: isMobile ? '14px 32px' : '16px 40px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: !name.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '180px' : '200px'
              }}
            >
              NEXT →
            </button>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#999',
            marginTop: '20px',
            lineHeight: '1.4',
            textAlign: 'center',
            padding: '0 10px'
          }}>
            *Your data is safe with us. We follow strict security measures to protect your privacy and never share your information without consent.{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
              Learn more
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    const uniqueFlags = [...new Set(flags.filter(f => f))];
    
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#e6f7e6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            fontSize: '32px'
          }}>
            ✅
          </div>
          
          <h2 style={{
            color: '#223875',
            fontSize: isMobile ? '24px' : '32px',
            marginBottom: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Thank you, {name}!
          </h2>
          
          <p style={{
            color: '#666',
            fontSize: isMobile ? '16px' : '18px',
            marginBottom: '40px',
            lineHeight: '1.5',
            textAlign: 'center'
          }}>
            Your sleep assessment has been submitted successfully.
          </p>
          
          <div style={{
            backgroundColor: '#FAF8F3',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '30px',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <h3 style={{
              color: '#223875',
              fontSize: isMobile ? '18px' : '20px',
              marginBottom: '16px',
              fontWeight: 'bold'
            }}>
              What's Next?
            </h3>
            <p style={{
              color: '#666',
              fontSize: isMobile ? '14px' : '16px',
              margin: 0,
              lineHeight: '1.5'
            }}>
              We'll analyze your responses and send personalized sleep insights and product recommendations to your email within 24 hours.
            </p>
          </div>

          <div style={{
            fontSize: '14px',
            color: '#888',
            borderTop: '1px solid #eee',
            paddingTop: '30px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '8px 0', fontWeight: '600' }}>
              Assessment Summary:
            </p>
            <p style={{ margin: '5px 0' }}>
              Questions answered: {Object.keys(responses).length}
            </p>
            <p style={{ margin: '5px 0' }}>
              Sleep patterns identified: {uniqueFlags.length}
            </p>
            {uniqueFlags.length > 0 && (
              <p style={{
                margin: '15px 0 0',
                fontSize: '12px',
                color: '#999'
              }}>
                Key areas: {uniqueFlags.slice(0, 3).join(', ')}
                {uniqueFlags.length > 3 && '...'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Contact form screen
  if (step >= questions.length) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{
            color: '#223875',
            fontSize: isMobile ? '22px' : '28px',
            marginBottom: '16px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Almost Done!
          </h2>
          
          <p style={{
            color: '#666',
            marginBottom: isMobile ? '24px' : '40px',
            textAlign: 'center',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '1.5'
          }}>
            Get your personalized sleep insights and recommendations.
          </p>

          {error && (
            <div style={{
              backgroundColor: '#ffeaea',
              border: '2px solid #ffb3b3',
              color: '#d00',
              padding: isMobile ? '12px' : '16px',
              borderRadius: isMobile ? '8px' : '12px',
              marginBottom: isMobile ? '20px' : '30px',
              fontSize: isMobile ? '13px' : '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: isMobile ? '24px' : '40px' }}>
            <input
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px 20px',
                border: '2px solid #E8E9EA',
                borderRadius: isMobile ? '8px' : '12px',
                fontSize: '16px',
                marginBottom: isMobile ? '12px' : '20px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              type="text"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#223875'}
              onBlur={(e) => e.target.style.borderColor = '#E8E9EA'}
              required
            />
            
            <input
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px 20px',
                border: '2px solid #E8E9EA',
                borderRadius: isMobile ? '8px' : '12px',
                fontSize: '16px',
                marginBottom: isMobile ? '12px' : '20px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#223875'}
              onBlur={(e) => e.target.style.borderColor = '#E8E9EA'}
              required
            />
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: isMobile ? '12px' : '20px'
            }}>
              <input
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '16px 20px',
                  border: '2px solid #E8E9EA',
                  borderRadius: isMobile ? '8px' : '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                type="text"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#223875'}
                onBlur={(e) => e.target.style.borderColor = '#E8E9EA'}
              />
              
              <select
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '16px 20px',
                  border: '2px solid #E8E9EA',
                  borderRadius: isMobile ? '8px' : '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: 'white',
                  transition: 'border-color 0.3s'
                }}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#223875'}
                onBlur={(e) => e.target.style.borderColor = '#E8E9EA'}
              >
                <option value="">Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !email}
            style={{
              width: '100%',
              backgroundColor: (!name || !email || isSubmitting) ? '#ccc' : '#223875',
              color: 'white',
              padding: isMobile ? '16px' : '18px',
              border: 'none',
              borderRadius: isMobile ? '8px' : '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (!name || !email || isSubmitting) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              marginBottom: isMobile ? '12px' : '20px'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Get My Sleep Insights'}
          </button>

          <p style={{
            fontSize: isMobile ? '11px' : '12px',
            color: '#999',
            textAlign: 'center',
            margin: 0
          }}>
            * Required fields
          </p>
        </div>
      </div>
    );
  }

  // Quiz questions screen
  const current = questions[step];
  const currentSection = getCurrentSection();
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '30px',
        padding: '0 20px',
        marginBottom: isMobile ? '16px' : '30px'
      }}>
        <img 
          src="/sloom-logo.png" 
          alt="Sloom Logo" 
          style={{
            height: isMobile ? '24px' : '32px'
          }}
        />
        <button style={{
          background: 'none',
          border: 'none',
          color: '#666',
          fontSize: isMobile ? '14px' : '16px',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}>
          Exit
        </button>
      </div>

      <div style={cardStyle}>
        {/* Section Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: isMobile ? '8px' : '16px',
          marginBottom: isMobile ? '24px' : '50px'
        }}>
          {sections.map((section) => {
            const isActive = currentSection && section.id === currentSection.id;
            const sectionProgress = getSectionProgress(section.id);
            
            return (
              <div
                key={section.id}
                style={{
                  backgroundColor: isActive ? '#FF8C94' : '#E8E9EA',
                  color: isActive ? 'white' : '#666',
                  padding: isMobile ? '10px 8px' : '20px 16px',
                  borderRadius: isMobile ? '8px' : '16px',
                  fontSize: isMobile ? '11px' : '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  transition: 'all 0.3s ease',
                  minHeight: isMobile ? '50px' : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <div>{section.name}</div>
                <div style={{
                  fontSize: isMobile ? '10px' : '12px',
                  marginTop: isMobile ? '4px' : '8px',
                  opacity: 0.8
                }}>
                  {Math.round(sectionProgress)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Question */}
        <h2 style={{
          color: '#333',
          fontSize: isMobile ? '20px' : '28px',
          marginBottom: isMobile ? '24px' : '50px',
          textAlign: 'center',
          lineHeight: '1.3',
          fontWeight: '600',
          padding: isMobile ? '0 8px' : '0'
        }}>
          {current.question}
        </h2>

        {/* Options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '24px' : '40px'
        }}>
          {current.options.map((option, idx) => (
            <button
              key={idx}
              style={{
                width: '100%',
                textAlign: isMobile ? 'left' : 'center',
                backgroundColor: '#F8F9FA',
                border: '2px solid #E8E9EA',
                padding: isMobile ? '16px' : '20px 24px',
                borderRadius: isMobile ? '12px' : '16px',
                fontSize: isMobile ? '15px' : '16px',
                color: '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                lineHeight: '1.4',
                boxSizing: 'border-box'
              }}
              onClick={() => handleAnswer(option)}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = '#223875';
                  e.target.style.borderColor = '#223875';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.target.style.backgroundColor = '#F8F9FA';
                  e.target.style.borderColor = '#E8E9EA';
                  e.target.style.color = '#333';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              onTouchStart={(e) => {
                if (isMobile) {
                  e.target.style.backgroundColor = '#223875';
                  e.target.style.borderColor = '#223875';
                  e.target.style.color = 'white';
                }
              }}
              onTouchEnd={(e) => {
                if (isMobile) {
                  setTimeout(() => {
                    e.target.style.backgroundColor = '#F8F9FA';
                    e.target.style.borderColor = '#E8E9EA';
                    e.target.style.color = '#333';
                  }, 150);
                }
              }}
            >
              {option.text}
            </button>
          ))}
        </div>

        {/* Back Button */}
        {step > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={() => setStep(step - 1)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#223875',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: '500',
                padding: '8px'
              }}
            >
              ← Back to previous question
            </button>
          </div>
        )}

        {/* Progress indicator */}
        <div style={{
          fontSize: isMobile ? '12px' : '14px',
          color: '#666',
          textAlign: 'center',
          marginTop: '16px',
          padding: '8px 0'
        }}>
          Question {step + 1} of {questions.length} • {Math.round(progress)}% complete
        </div>
      </div>
    </div>
  );
}