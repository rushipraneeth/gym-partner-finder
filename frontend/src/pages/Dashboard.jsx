import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Loader from '../components/Loader';
import Button from '../components/Button';
import DashboardHeader from '../components/DashboardHeader';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    matchesCount: 0,
    requestsCount: 0,
    isLookingToday: false,
    activityData: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch matches count
        const matchesRes = await api.get('/api/matches').catch(() => null);
        const matchesCount = matchesRes?.data?.eligibleCandidates?.length || 0;

        // Fetch received requests count
        const requestsRes = await api.get('/api/partner-requests/received').catch(() => null);
        const requestsCount = requestsRes?.data?.receivedRequests?.filter(r => r.status === 'pending').length || 0;

        // Check if looking today (this requires creating a small try/catch around get matches to infer or just catching errors)
        // Check if looking today (this requires creating a small try/catch around get matches to infer or just catching errors)
        const todayRes = await api.get('/api/today/matches').catch(() => null);
        const isLookingToday = todayRes?.data?.success || false;

        // Fetch workout schedule for activity chart via matching profile
        const profileRes = await api.get('/api/users/matching-profile').catch(() => null);
        const workouts = profileRes?.data?.matchingProfile?.workoutSchedule || [];
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const activityData = days.map(day => {
          const workout = workouts.find(w => w.day === day);
          if (!workout) return 10; // 10% baseline if no workout
          
          try {
            const [startH, startM] = workout.startTime.split(':').map(Number);
            const [endH, endM] = workout.endTime.split(':').map(Number);
            const durationHours = (endH + endM / 60) - (startH + startM / 60);
            
            let height = 20 + (durationHours * 30);
            return Math.min(100, Math.max(20, height)); // clamp between 20% and 100%
          } catch (e) {
            return 40; // Default height if parsing fails
          }
        });

        setStats({
          matchesCount,
          requestsCount,
          isLookingToday,
          activityData
        });
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.gymId) {
       fetchDashboardData();
    } else {
       setLoading(false);
    }
  }, [user]);

  if (loading) return <Loader />;

  const isProfileComplete = user?.gymId && user?.goal && user?.experienceLevel;
  return (
    <div className="bento-dashboard animate-fade-in pb-10">
      <DashboardHeader />

      <div className="bento-grid">
        
        {/* Left Column (Main Stats) */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Matches */}
            <div onClick={() => navigate('/matches')} className="hover-card" style={{flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '24px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease'}}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm font-medium"><span style={{background: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>@</span> Matches</div>
                <span style={{cursor: 'pointer'}}>⋮</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <h2 style={{fontSize: '3.5rem', margin: 0, fontWeight: 400, letterSpacing: '-0.03em'}}>{stats.matchesCount}</h2>
                <div style={{background: 'var(--accent-lime)', padding: '0.2rem 0.5rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.8rem'}}>100%</div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(10)].map((_, i) => <div key={i} style={{width: '18px', height: '32px', borderRadius: '99px', background: i < (stats.matchesCount || 3) ? '#1a1b1e' : 'rgba(0,0,0,0.06)'}}></div>)}
              </div>
            </div>

            {/* Requests - LIME CARD */}
            <div onClick={() => navigate('/requests')} className="hover-card" style={{flex: 1, background: 'var(--accent-lime)', borderRadius: '24px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease'}}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm font-medium"><span style={{background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>⇆</span> Requests</div>
                <span style={{cursor: 'pointer'}}>⋮</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <h2 style={{fontSize: '3.5rem', margin: 0, fontWeight: 400, letterSpacing: '-0.03em'}}>{stats.requestsCount}</h2>
                <div style={{background: 'white', padding: '0.2rem 0.5rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.8rem'}}>New</div>
              </div>
              <div className="flex gap-1 mt-4">
                {[...Array(10)].map((_, i) => <div key={i} style={{width: '18px', height: '32px', borderRadius: '99px', background: i < (stats.requestsCount || 4) ? '#1a1b1e' : 'rgba(0,0,0,0.06)'}}></div>)}
              </div>
            </div>
          </div>

          {/* Statistics Chart */}
          <div style={{background: 'rgba(0,0,0,0.03)', borderRadius: '24px', padding: '1.5rem', height: '260px', display: 'flex', flexDirection: 'column'}}>
            <div className="flex items-center gap-4 mb-4">
              <h3 style={{margin: 0, fontWeight: 500}}>Activity</h3>
            </div>
            <div className="flex items-end justify-between flex-1 pt-4 pb-2">
              {stats.activityData.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div style={{width: '24px', height: '120px', background: 'rgba(0,0,0,0.04)', borderRadius: '99px', position: 'relative', display: 'flex', alignItems: 'flex-end'}}>
                      <div style={{width: '100%', height: `${h}%`, background: h > 70 ? '#1a1b1e' : 'var(--accent-lime)', borderRadius: '99px', transition: 'height 0.5s ease'}}></div>
                  </div>
                  <span style={{fontSize: '0.75rem', color: '#888'}}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column 1 (Dark CTA) */}
        <div className="col-span-1 flex flex-col h-full">
          <div style={{background: '#1a1b1e', color: 'white', borderRadius: '24px', padding: '2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, rgba(26,27,30,0.9), rgba(26,27,30,0.4))'}}></div>
              <h2 style={{position: 'relative', fontSize: '1.8rem', margin: 0, fontWeight: 400, lineHeight: 1.2}}>Take Your<br/>Workouts<br/>to the Next<br/>Level</h2>
              <Link to="/profile" style={{position: 'relative', background: 'white', color: 'black', padding: '0.75rem 1.25rem', borderRadius: '99px', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', width: '90%'}}>
                Update Profile <span style={{fontSize: '1.2rem'}}>→</span>
              </Link>
          </div>
        </div>

        {/* Right Column 2 (List Cards) */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="flex gap-4">
            <div onClick={() => addToast('Community feature coming soon!', 'info')} className="hover-card" style={{flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '24px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'}}>
              <div style={{background: 'white', padding: '0.5rem', borderRadius: '50%', marginBottom: '0.5rem'}}>👥</div>
              <span style={{fontSize: '0.85rem', fontWeight: 500}}>Community</span>
            </div>
            <div onClick={() => addToast('Academy feature coming soon!', 'info')} className="hover-card" style={{flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '24px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'}}>
              <div style={{background: 'white', padding: '0.5rem', borderRadius: '50%', marginBottom: '0.5rem'}}>📚</div>
              <span style={{fontSize: '0.85rem', fontWeight: 500}}>Academy</span>
            </div>
          </div>

          <div onClick={() => addToast('Help Center coming soon!', 'info')} className="hover-card" style={{background: 'rgba(0,0,0,0.03)', borderRadius: '24px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'}}>
            <h4 style={{margin: '0 0 0.25rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem'}}>Help Center <span style={{fontWeight: 300}}>↗</span></h4>
            <p style={{fontSize: '0.8rem', color: '#888', margin: 0}}>Explore our detailed documentation...</p>
          </div>

          <div onClick={() => navigate('/matches')} className="hover-card" style={{background: 'rgba(0,0,0,0.03)', borderRadius: '24px', padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'}}>
            <h4 style={{margin: '0 0 0.25rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem'}}>Partner Directory <span style={{fontWeight: 300}}>↗</span></h4>
            <p style={{fontSize: '0.8rem', color: '#888', margin: 0}}>Find the perfect partner to support...</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
