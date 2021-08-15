import React from "react";
import {
  Experiment,
  ExperimentPattern,
  ExperimentType,
  ExperimentInCookie,
} from "@/@types/googleOptimize.d";
import * as i18n from "@/services/i18n";

/**
 * Name of experiment.
 *
 * @param props.experiment {Experiment} Experiment Object to display.
 */
function ExperimentName(props: any) {
  const experiment: Experiment = props.experiment;
  const nameExists = !!experiment.name;
  return (
    <a
      className="experiments-table__optimize-url"
      href={experiment.optimizeUrl}
      title="Open a experience detail page."
      target="_blank"
    >
      {nameExists ? (
        <span className="experiments-table__test-name">{experiment.name}</span>
      ) : null}
      <span className="experiments-table__test-id">ID: {experiment.testId}</span>
    </a>
  );
}

/**
 * Link to report of experiment.
 *
 * @param props.experiment {Experiment} Experiment Object to display.
 */
function ExperimentReport(props: any) {
  const experiment: Experiment = props.experiment;
  const urlExists = !!experiment.optimizeUrl;
  if (urlExists) {
    return (
      <a
        className="experiments-table__optimize-report"
        href={experiment.optimizeUrl + "/report"}
        title="Open a experience report page."
        target="_blank"
      >
        <svg className="icon icon-open-outline">
          <use xlinkHref="/img/icons.svg#icon-open-outline" />
        </svg>
      </a>
    );
  } else {
    return <span>-</span>;
  }
}

/**
 * Editor url of experiment.
 *
 * @param props.experiment {Experiment} Experiment Object to display.
 * @param props.url {string} URL of current tab.
 */
function ExperimentTarget(props: any) {
  const experiment: Experiment = props.experiment;
  const url: string = props.url;

  let editorPageUrl = experiment.editorPageUrl;
  if (editorPageUrl != null && editorPageUrl.startsWith("/")) {
    let parsed = new URL(url);
    editorPageUrl = parsed.origin + editorPageUrl;
  }
  if (editorPageUrl != null) {
    return (
      <a
        className="experiments-table__target-url"
        href={editorPageUrl}
        title={editorPageUrl}
        target="_blank"
      >
        {editorPageUrl}
      </a>
    );
  } else {
    return <span>-</span>;
  }
}

/**
 * @typedef ExperimentPatternProps
 * @param patterns {ExperimentPattern[]} Information of patterns of experiment.
 * @param selected {ExperimentPattern[]} Selected patterns.
 * @param onChangePattern {Function} Callback function to be executed when pattern is selected.
 */
export type ExperimentPatternProps = {
  type: ExperimentType;
  patterns: ExperimentPattern[];
  selected: ExperimentInCookie;
  onChangePattern: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: ExperimentType
  ) => void;
};

/**
 * @typedef ExperimentsTableProps
 *
 * @param url {string} URL of current tab.
 * @param experiments {Experiment[]} Experiment Object to display.
 * @param experimentPatterns {React.VoidFunctionComponent} Component of experiment patterns.
 * @param patterns {ExperimentPattern[]} Current Patterns.
 * @param onChangePattern {Function} Callback function to be executed when pattern is selected.
 */
type ExperimentsTableProps = {
  url: string;
  experiments: Experiment[];
  experimentPatterns: React.VoidFunctionComponent<ExperimentPatternProps>;
  patterns?: ExperimentInCookie[];
  onChangePattern?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: ExperimentType
  ) => void;
};

/**
 * Table of experiments.
 *
 * @param props {ExperimentsTableProps}
 */
export function ExperimentsTable({
  url,
  experiments,
  patterns=[],
  onChangePattern,
  experimentPatterns,
}: ExperimentsTableProps) {

  const ExperimentPatterns = experimentPatterns;
  const tableBody = [];
  for (const expe of experiments) {
    let selected = patterns.find((s) => s.testId === expe.testId);
    if (!selected) {
      selected = {
        testId: undefined,
        type: undefined,
        expire: undefined,
        pattern: undefined,
      };
    }
    tableBody.push(
      <tr key={expe.testId}>
        <td className="table-body__name">
          <ExperimentName experiment={expe} />
        </td>
        <td className="table-body__report">
          <ExperimentReport experiment={expe} />
        </td>
        <td>
          <ExperimentTarget experiment={expe} url={url} />
        </td>
        <td className="table-body__pattern">
          <ExperimentPatterns
            type={expe.type}
            patterns={expe.patterns}
            selected={selected}
            onChangePattern={onChangePattern}
          />
        </td>
      </tr>
    );
  }
  return (
    <table className="experiments-table">
      <thead>
        <tr>
          <th className="experiments-table__name">{i18n.t("columnNameName")}</th>
          <th className="experiments-table__report">{i18n.t("columnNameReport")}</th>
          <th className="experiments-table__target-url">{i18n.t("columnNameEditor")}</th>
          <th className="experiments-table__pattern">{i18n.t("columnNamePattern")}</th>
        </tr>
      </thead>
      <tbody>{tableBody}</tbody>
    </table>
  );
}
