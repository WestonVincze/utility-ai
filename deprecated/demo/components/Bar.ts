const setValueInRange = (value: number, min =  0, max = 100) => {
  return Math.max(min, Math.min(value, max));
}
const generateBarView = (name: string, value: number) => `${name}: <span class="value">${value.toFixed(2)}</span>`;

export const createBarUI = (containerId: string, stat: string, initialValue: number, onChange: (value: number) => void) => {
  let _statValue = setValueInRange(initialValue);
  let _editMode = false;
  const containerEl = document.querySelector(`#${containerId}`);

  if (!containerEl) {
    console.warn(`${containerId} not found.`)
    return;
  }

  const setStatValue = (value: number) => {
    _statValue = setValueInRange(value);
  }

  const barEl = document.createElement("div");
  barEl.id = stat; 
  barEl.classList.add("bar");

  const statEl = document.createElement("div");
  statEl.classList.add("stat");
  statEl.innerHTML = generateBarView(stat, initialValue);

  const buttonEl = document.createElement("button");
  buttonEl.innerText = "edit";

  barEl.appendChild(statEl);
  barEl.appendChild(buttonEl);
  containerEl.appendChild(barEl);

  const span = statEl.querySelector(".value");

  const update = (value: number) => {
    if (!span) return;
    setStatValue(value);
    span.innerHTML = value.toFixed(2);
  }

  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;

    toggleEdit();
  }

  const toggleEdit = () => {
    if (!span) return;
    _editMode = !_editMode;
    if (_editMode) {
      span.innerHTML = `<input type="text" value="${_statValue.toFixed(2)}"></input>`
      buttonEl.innerText = "save";
      const input = span.querySelector("input");
      input?.focus();
      input?.select();
      input?.addEventListener("keydown", handleEnterKey);
    } else {
      const input = statEl.querySelector("input");
      setStatValue(parseFloat(input!.value));
      onChange(_statValue);
      span.innerHTML = _statValue.toFixed(2);
      buttonEl.innerText = "edit";
      input?.removeEventListener("keydown", handleEnterKey);
    }
  }

  buttonEl.addEventListener("click", () => toggleEdit());

  return { update }
}