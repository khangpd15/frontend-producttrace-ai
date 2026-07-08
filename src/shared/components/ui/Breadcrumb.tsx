import React from 'react';

export default function Breadcrumb({ items }: { items: { label: string, href?: string }[] }) {
  return (
    <nav className="flex text-sm text-text-secondary mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-primary">{item.label}</a>
          ) : (
            <span className="font-medium text-text-primary">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
