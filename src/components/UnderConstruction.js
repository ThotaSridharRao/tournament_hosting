import React from 'react';
import Layout from './Layout';

const UnderConstruction = () => (
  <Layout>
    <div className="container text-center" style={{ 
      minHeight: '50vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div>
        <i className="fas fa-tools" style={{ 
          fontSize: '4rem', 
          color: 'var(--primary-color)', 
          marginBottom: '1rem' 
        }}></i>
        <h1>Under Construction</h1>
        <p>This page is currently being built. Check back soon!</p>
      </div>
    </div>
  </Layout>
);

export default UnderConstruction;