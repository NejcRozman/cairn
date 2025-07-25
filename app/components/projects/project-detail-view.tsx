"use client";

import { useState } from "react";
import { Project, Reproducibility } from "../../lib/types";
import {
  ChevronLeftIcon,
  PlusIcon,
  CodeIcon,
  LinkIcon,
  UsersGroupIcon,
  ChartBarIcon,
  ScaleIcon,
} from "../ui/icons";
import PoRModule from "./por-module";
import { OutputListItem } from "./output-list-item";
import { useAppContext } from "../../context/app-provider";
import { GenerativePlaceholder } from "../ui/generative-placeholder";
import { AddressDisplay } from "../ui/address-display";
import { ImpactLevelBadge } from "../ui/impact-level-badge";
import { Modal } from "../ui/modal";

// --- Start of components moved into this file for locality ---

const getImpactLevel = (
  level: number
): "Undefined" | "Low" | "Medium" | "High" => {
  switch (level) {
    case 0:
      return "Undefined";
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    default:
      return "Undefined";
  }
};

const ImpactAssetOwnershipWidget = ({ project }: { project: Project }) => {
  const impactLevel = getImpactLevel(project.impact);
  return (
    <div className="bg-primary-light/40 dark:bg-primary/10 rounded-xl p-6 border border-primary/30 dark:border-primary/50">
      <div className="flex items-center">
        <UsersGroupIcon className="w-6 h-6 mr-3 text-primary" />
        <h3 className="text-xl font-semibold text-text dark:text-text-dark">
          Impact Asset Ownership
        </h3>
      </div>
      <div className="my-4">
        <ImpactLevelBadge level={impactLevel as any} />
      </div>
      <ul className="divide-y divide-border dark:divide-primary/20">
        {project.tokenOwners.map((owner, index) => (
          <li key={index} className="py-4">
            <div className="flex justify-between items-start">
              <p className="text-md font-semibold text-text dark:text-text-dark">
                {project.tokenUnits[index] > 1}
              </p>
              <span className="text-lg font-bold text-primary flex-shrink-0 ml-4">
                {(project.tokenUnits[index] / 10).toFixed(1)}%
              </span>
            </div>
            <AddressDisplay address={owner} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const FundingDetailsWidget = ({ project }: { project: Project }) => {
  const { fundingHistory } = useAppContext();
  const numberFormatter = new Intl.NumberFormat("de-DE");

  const projectFundingEvents = fundingHistory.filter(
    (f) => f.projectId === project.id
  );
  const firstFundedDate =
    projectFundingEvents.length > 0
      ? new Date(
          projectFundingEvents.reduce((oldest, current) =>
            new Date(current.timestamp) < new Date(oldest.timestamp)
              ? current
              : oldest
          ).timestamp
        ).toLocaleDateString()
      : "N/A";
  const funders = [...new Set(projectFundingEvents.map((f) => f.funderWallet))];

  return (
    <div className="bg-background-light dark:bg-background-dark-light rounded-xl p-6 border border-border dark:border-border-dark">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="w-6 h-6 mr-3 text-primary" />
        <h3 className="text-xl font-semibold text-text dark:text-text-dark">
          Funding Details
        </h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-text-secondary dark:text-text-dark-secondary">
            Total Raised
          </p>
          <p className="text-2xl font-bold text-status-success mt-1">
            ${numberFormatter.format(project.fundingGoal / 1_000_000)}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-secondary dark:text-text-dark-secondary mb-2">
            Funder
          </p>
          <ul className="space-y-2">{project.funder}</ul>
        </div>
      </div>
    </div>
  );
};

const ProjectFundingModal = ({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) => {
  return (
    <Modal
      onClose={onClose}
      title={`Impact & Funding Details for "${project.title}"`}
    >
      <div className="space-y-6">
        {project.tokenOwners && project.tokenOwners.length > 0 && (
          <ImpactAssetOwnershipWidget project={project} />
        )}
        {project.funder != "0x0000000000000000000000000000000000000000" && (
          <FundingDetailsWidget project={project} />
        )}
      </div>
    </Modal>
  );
};
// --- End of local components ---

export const ProjectDetailView = ({
  project,
  onBack,
  onPorSubmitClick,
  onAddOutputClick,
  onViewReproducibility,
}: {
  project: Project;
  onBack: () => void;
  onPorSubmitClick: () => void;
  onAddOutputClick: () => void;
  onViewReproducibility: (rep: Reproducibility) => void;
}) => {
  const { currentUser } = useAppContext();
  const isOwner = project.ownerId.toLowerCase() === currentUser.walletAddress;
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  //   const impactLevel = getImpactLevel(project.hypercertFraction);

  return (
    <div className="animate-fade-in space-y-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-sm text-primary font-semibold mb-6 hover:underline"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-background-light dark:bg-background-dark-light rounded-xl shadow-lg overflow-hidden border border-border dark:border-border-dark">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-40 object-cover rounded-md"
          />
        ) : (
          <GenerativePlaceholder
            projectId={project.id}
            className="w-full h-40"
          />
        )}
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-text dark:text-text-dark">
                {project.title}
              </h2>
              {project.organization && (
                <p className="text-lg font-semibold text-primary dark:text-primary-light mt-1">
                  {project.organization}
                </p>
              )}
              {project.additionalInfoUrl && (
                <div className="mt-2">
                  <a
                    href={project.additionalInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-primary dark:text-primary-light font-semibold hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Contributor Info</span>
                  </a>
                </div>
              )}
            </div>
            {/* <div className="flex items-center space-x-2 flex-shrink-0">
              <ImpactLevelBadge level={impactLevel} />
              <StatusBadge status={project.status} />
            </div> */}
          </div>
          {/* <p className="text-md text-text-secondary dark:text-text-dark-secondary mt-1">
            {project.domain}
          </p> */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary-light text-primary text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary/20 dark:text-primary-light"
              >
                {tag}
              </span>
            ))} */}
          </div>
          <p className="mt-4 text-base text-text-secondary dark:text-text-dark-secondary">
            {project.description}
          </p>
          <div className="mt-6 pt-4 border-t border-border dark:border-border-dark flex justify-between items-end">
            <div className="font-mono text-xs text-text-secondary dark:text-text-dark-secondary">
              <p>Owner: {project.ownerId}</p>
              <p>CID: {project.cid}</p>
            </div>

            <button
              onClick={() => setIsFundingModalOpen(true)}
              className="flex items-center space-x-2 bg-primary-light text-primary font-semibold py-2 px-4 rounded-lg hover:bg-blue-200/50 dark:bg-primary/20 dark:text-primary-light dark:hover:bg-primary/30 transition-colors text-sm shadow-sm"
            >
              <ScaleIcon className="w-5 h-5" />
              <span>View Ownership & Funding</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-background-light dark:bg-background-dark-light rounded-xl shadow-lg p-8 border border-border dark:border-border-dark h-full w-full break-words">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-text dark:text-text-dark">
              Research Outputs
            </h3>
          </div>
          {project.output[0] ? (
            <ul className="divide-y divide-border dark:divide-border-dark">
              <OutputListItem key={0} output={project.output[0]} />
            </ul>
          ) : (
            <div className="text-center py-8 px-6 border-2 border-dashed border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark/50">
              <CodeIcon className="mx-auto h-12 w-12 text-text-secondary" />
              <h4 className="mt-4 text-lg font-semibold text-text dark:text-text-dark">
                No Outputs Yet
              </h4>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-dark-secondary">
                {isOwner
                  ? "Add research outputs to make this project active and reviewable."
                  : "The researcher has not recorded any outputs for this project yet."}
              </p>
              {isOwner && project.output[0] === undefined && (
                <button
                  onClick={onAddOutputClick}
                  className="mt-6 flex items-center mx-auto space-x-2 bg-primary text-primary-text font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors text-sm shadow-md hover:shadow-lg"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Outputs</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-background-light dark:bg-background-dark-light rounded-xl shadow-lg p-6 border border-border dark:border-border-dark h-full">
          <PoRModule
            project={project}
            isOwner={isOwner}
            onPorSubmitClick={onPorSubmitClick}
            onViewReproducibility={onViewReproducibility}
            className="h-full"
          />
        </div>
      </div>

      {isFundingModalOpen && (
        <ProjectFundingModal
          project={project}
          onClose={() => setIsFundingModalOpen(false)}
        />
      )}
    </div>
  );
};
