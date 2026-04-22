import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-xs text-muted-foreground mb-2 gap-1">
          {breadcrumbs.map((c, i) => (
            <React.Fragment key={i}>
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          {/* title は TopHeader に委譲。description のみここで表示 */}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {title && (
        <h1 className="sr-only">{title}</h1>
      )}
      {children}
    </div>
  );
}

export function Section({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("bg-card border rounded-lg", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            {title && <h2 className="font-semibold text-sm">{title}</h2>}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="font-medium text-sm">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1 max-w-sm">
          {description}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
