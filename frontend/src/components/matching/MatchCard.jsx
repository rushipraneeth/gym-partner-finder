import React from 'react';
import UserAvatar from '../common/UserAvatar';
import Button from '../Button';
import { Clock, Calendar, Dumbbell, Award } from '../common/Icons';

const MatchCard = ({
  matchData,
  relationshipStatus,
  onOpenDetails,
  onSendRequest,
  onReviewRequest,
}) => {
  const { candidate, matchPercentage, scoreBreakdown, matchReasons, schedule } = matchData;

  // Extract common days from reasons or schedule
  const scheduledDays = schedule?.map((s) => s.day) || [];

  const renderActionButton = () => {
    switch (relationshipStatus) {
      case 'connected':
        return (
          <Button variant="outline" size="sm" disabled className="flex-1">
            Connected ✓
          </Button>
        );
      case 'sent':
        return (
          <Button variant="outline" size="sm" disabled className="flex-1">
            Request Pending
          </Button>
        );
      case 'received':
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={onReviewRequest}
            className="flex-1"
          >
            Review Request
          </Button>
        );
      default:
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSendRequest(candidate._id)}
            className="flex-1"
          >
            Connect
          </Button>
        );
    }
  };

  const scoreNum = parseFloat(matchPercentage) || 0;
  const isHighMatch = scoreNum >= 80;

  return (
    <div className="card match-card flex flex-col justify-between">
      <div className="card-body">
        {/* Header: Avatar, Name, Goal, Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar name={candidate.username} size="lg" />
            <div className="min-w-0">
              <h3 className="match-card-name truncate" style={{ fontSize: '1rem', margin: 0 }}>
                {candidate.username}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {candidate.gymId || 'Local Gym'}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {candidate.goal && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                    {candidate.goal}
                  </span>
                )}
                {candidate.experienceLevel && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                    {candidate.experienceLevel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className={`badge ${isHighMatch ? 'badge-success' : 'badge-primary'}`}
            style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '0.25rem 0.625rem' }}
          >
            {isHighMatch && <Award size={12} />}
            {matchPercentage}
          </div>
        </div>

        {/* Compatibility Metrics */}
        <div className="match-metrics-grid mb-3">
          <div className="metric-cell">
            <span className="metric-label">Time Match</span>
            <span className="metric-val">{scoreBreakdown?.timeScore || '—'}</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Days Match</span>
            <span className="metric-val">{scoreBreakdown?.dayScore || '—'}</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Workout Split</span>
            <span className="metric-val">{scoreBreakdown?.workoutScore || '—'}</span>
          </div>
        </div>

        {/* Top Match Reason Callout */}
        {matchReasons?.[0] && (
          <div className="match-reason-callout mb-3">
            <span className="reason-text truncate">
              💡 {matchReasons[0]}
            </span>
          </div>
        )}

        {/* Scheduled Training Days Badges */}
        {scheduledDays.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>
              Days:
            </span>
            {scheduledDays.map((day) => (
              <span
                key={day}
                className="badge badge-neutral"
                style={{ fontSize: '0.6875rem', padding: '0.125rem 0.375rem' }}
              >
                {day.slice(0, 3)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="card-footer" style={{ padding: '0.875rem 1.25rem' }}>
        <Button variant="ghost" size="sm" onClick={() => onOpenDetails(matchData)}>
          Breakdown
        </Button>
        {renderActionButton()}
      </div>
    </div>
  );
};

export default MatchCard;
