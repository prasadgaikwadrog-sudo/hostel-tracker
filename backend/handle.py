from pathlib import Path
path = Path("fh.text")

path.write_text("Writing ")

print(path.read_text())

file =open("fh.text","w")
try:
  file.write("1")
finally:
  file.close()
