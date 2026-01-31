import React from 'react';

const AppFooter = () => (
  <footer className="border-top bg-white mt-auto">
    <div className="container d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-4 gap-2">
      <div>
        <div className="fw-semibold">Meme Game</div>
        <small className="text-muted-soft">
          Built with React + Design React Kit.
        </small>
      </div>
      <small className="text-muted-soft">
        Tip: Best captions score 5 points.
      </small>
    </div>
  </footer>
);

export default AppFooter;
