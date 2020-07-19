import os
from shutil import copyfile


sourceDirectory = "D:\\Download"
outputDirectory = "D:\\Download\\Textures"
textureDirectory = "D:\\Naruto models\\chinese\\chinese\\chinese"

textures = []

for root, dirs, files in os.walk(sourceDirectory):
    for file in files:
        if file.endswith(".mdl"):
            print("Reading file", file)
            fileFullPath = os.path.join(root, file)
            with open(fileFullPath) as f:
                contents = f.read()
                lines = contents.split("\n")
                for index, line in enumerate(lines):
                    if line.startswith("Textures"):
                        for anotherIndex, anotherLine in enumerate(lines[index+1:]):
                            if anotherLine.lstrip().startswith("Image"):
                                imagePath = anotherLine.split("\"")[1]
                                textures.append(imagePath)

for texture in textures:
    textureFileName = texture.split("\\")[-1]
    found = False
    for root, dirs, files in os.walk(textureDirectory):
        for file in files:
            if file.lower() == textureFileName.lower():
                fileFullPath = os.path.join(root, file)
                if "\\" in texture:
                    targetParentPath = os.path.join(outputDirectory, "\\".join(texture.split("\\")[:-1]))
                    if not os.path.exists(targetParentPath):
                        os.makedirs(targetParentPath)
                targetFullPath = os.path.join(outputDirectory, texture)
                copyfile(fileFullPath, targetFullPath)
                found = True 
    if not found:
        print("!!! Texture not found:", texture)
    else:
        print("Texture found:", texture)
