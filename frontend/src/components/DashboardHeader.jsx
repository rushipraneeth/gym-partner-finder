import React from 'react';
import PageHeader from './common/PageHeader';

const DashboardHeader = (props) => {
  return <PageHeader title="Gym Partner Finder" description="Find workout partners and sync weekly training schedules" {...props} />;
};

export default DashboardHeader;
