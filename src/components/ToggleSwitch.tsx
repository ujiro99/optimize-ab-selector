import "@/scss/toggle-switch.scss";

type ToggleSwitchProps = {
  name: string;
  default: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export function ToggleSwitch(props: ToggleSwitchProps): JSX.Element {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        name={props.name}
        checked={props.default}
        onChange={props.onChange}
      />
      <span className="slider round"></span>
    </label>
  );
}

