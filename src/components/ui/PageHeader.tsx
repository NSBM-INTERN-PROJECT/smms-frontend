import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  badge,
}) => {
  return (
    <div className="page-header animate-fade-in">
      <div className="page-header-left">
        {icon && <div className="page-header-icon">{icon}</div>}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title text-gradient">{title}</h1>
            {badge && (
              <span className="badge badge-cyan font-mono">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
