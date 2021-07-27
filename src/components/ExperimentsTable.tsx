import React from "react";
import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";

/**
 * Name of experiment.
 *
 * @param props.experiment {Experiment} Experiment Object to display.
 */
function ExperimentName(props: any) {
  const experiment: Experiment = props.experiment;
  return (
    <a
      className="experiments-table__optimize-url"
      href={experiment.optimizeUrl}
      target="_blank"
    >
      <span className="experiments-table__testName" title={experiment.name}>
        {experiment.name}
      </span>
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
  return (
    <a
      className="experiments-table__optimize-report"
      href={experiment.optimizeUrl + "/report"}
      title={experiment.optimizeUrl + "/report"}
      target="_blank"
    >
      <svg className="icon icon-open-outline">
        <use xlinkHref="/img/icons.svg#icon-open-outline" />
      </svg>
    </a>
  );
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
}

// Construct Google Optimize's information table.
function TableBody(props: any) {
  const experiments: Experiment[] = props.experiments || [];
  const selectedPatterns: ExperimentPattern[] = props.patterns || [];
  const url: string = props.url;
  const ExperimentPatterns = props.experimentPatternsComponent;
  const onChangePattern: Function = props.changePattern;
  const tableBody = [];
  for (const expe of experiments) {
    let selected = selectedPatterns.find((s) => s.testId === expe.testId);
    if (!selected) {
      selected = { testId: undefined, name: undefined, number: undefined };
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
        <td>
          <ExperimentPatterns
            patterns={expe.patterns}
            selected={selected.number}
            onChangePattern={onChangePattern}
          />
        </td>
      </tr>
    );
  }
  return <tbody>{tableBody}</tbody>;
}

/**
 * @typedef ExperimentPatternProps
 * @param patterns {ExperimentPattern[]} Information of patterns of experiment.
 * @param selected {number} Pattern number.
 * @param onChangePattern {Function} Callback function to be executed when pattern is selected.
 */
export type ExperimentPatternProps = {
  patterns: ExperimentPattern[];
  selected: number;
  onChangePattern: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
  patterns?: ExperimentPattern[];
  onChangePattern?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
  patterns,
  onChangePattern,
  experimentPatterns,
}: ExperimentsTableProps) {
  return (
    <table className="experiments-table">
      <thead>
        <tr>
          <th className="experiments-table__name">Name</th>
          <th className="experiments-table__report">Report</th>
          <th className="experiments-table__target-url">Editor Page</th>
          <th className="experiments-table__pattern">Pattern</th>
        </tr>
      </thead>
      <TableBody
        url={url}
        experiments={experiments}
        patterns={patterns}
        changePattern={onChangePattern}
        experimentPatternsComponent={experimentPatterns}
      />
    </table>
  );
}