import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface VersionConfig {
  label: string;
  path: string;
}

interface VersionSwitcherProps {
  versions: VersionConfig[];
  currentPath: string;
}

export function VersionSwitcher({ versions, currentPath }: VersionSwitcherProps) {
  if (!versions || versions.length <= 1) return null;

  const current = versions.find((v) => currentPath.includes(`/docs/${v.path}/`)) || versions[0];

  function switchVersion(target: VersionConfig) {
    const regex = /\/docs\/([^/]+)\//;
    const match = currentPath.match(regex);
    if (match) {
      const newPath = currentPath.replace(`/docs/${match[1]}/`, `/docs/${target.path}/`);
      window.location.href = newPath;
    } else {
      window.location.href = `/docs/${target.path}/`;
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="bd-version-trigger">
          {current.label}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bd-version-menu" sideOffset={4} align="start">
          {versions.map((v) => (
            <DropdownMenu.Item
              key={v.path}
              className={`bd-version-item ${v.path === current.path ? "bd-version-active" : ""}`}
              onSelect={() => switchVersion(v)}
            >
              {v.label}
              {v.path === current.path && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
