import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  data: any = null;
  originalData: any = this.data; // Copy to keep track when filtering/sorting
  library: any = null;

  filterOptions = ['All', 'Categories', 'Sources'];
  selectedFilterOption = this.filterOptions[0];

  selectedCategoryOption: any = 'Default';
  selectedSourceOption: any = '';

  sortOptions = ['Added Date', 'Source'];
  selectedSortOption = this.sortOptions[0];
  sortDirections = ['Ascending', 'Descending'];
  selectedSortDirection = this.sortDirections[0];


  displayedColumns = ['ID', 'Title', 'Added', 'Category', 'Source', 'Resolved'];

  ngOnInit(): void {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const text = e.target.result;
        const json = JSON.parse(text);
        json.manga.forEach((manga: { resolved: boolean; }) => manga.resolved = false);
        this.data = json;
        this.originalData = JSON.parse(JSON.stringify(this.data));
        this.library = this.listToMap(this.data.library, 'mangaId');
        console.log('Data: ', this.originalData);
        console.log('Library: ', this.library);
      };

      reader.readAsText(file);
    } else {
      console.error("Please upload a valid JSON file.");
    }
  }
  

  printManga(manga: any) {
    console.log("Manga: ", manga);
    console.log("Library: ", this.library[manga.id])

    manga.resolved = !manga.resolved;
  }

  getAddedDate(mangaId: string) {
    const item = this.library[mangaId];
    return item ? item.dateAdded * 1000 : undefined;
  }

  getCategories(mangaId: string) {
    const item = this.library[mangaId];
    if (item == null) return undefined;
    else if (item.categories.length <= 0) return 'default';
    else return item.categories;
  }

  updateFilter(): void {
    switch(this.selectedFilterOption) {
      case this.filterOptions[0]:
        console.log("Updated filter to: ", this.filterOptions[0]);
        this.filterByAll();
        break;
      case this.filterOptions[1]:
        console.log("Updated filter to: ", this.filterOptions[1]);
        this.filterByCategory();
        break;
        case this.filterOptions[2]:
        console.log("Updated filter to: ", this.filterOptions[2]);
        this.filterBySource();
        break;
    }
  }

  updateSorting(): void {
    switch(this.selectedSortOption) {
      case this.sortOptions[0]:
        console.log("Updated sorting to: ", this.sortOptions[0]);
        this.data.manga = this.data.manga.sort((mangaA: any, mangaB: any) => {
          const libraryA = this.library[mangaA.id];
          const libraryB = this.library[mangaB.id];

          if (this.selectedSortDirection === this.sortDirections[0]) {
          // Mangas that don't have an added date get sorted to top
            if (libraryA == null) return -1;
            if (libraryB == null) return 1;
            return (libraryA.dateAdded * 1000) - (libraryB.dateAdded * 1000);
          }
          else {
            // Mangas that don't have an added date get sorted to bottom
            if (libraryA == null) return 1;
            if (libraryB == null) return -1;
            return (libraryB.dateAdded * 1000) - (libraryA.dateAdded * 1000);
          }

        });
        break;
      case this.sortOptions[1]:
        console.log("Updated sorting to: ", this.sortOptions[1]);
        break;
    }
  }

  private filterByAll() {
    this.data.manga = this.originalData.manga;
  }

  private filterByCategory() {
    console.log('selectedCategoryOption', this.selectedCategoryOption);

    switch(this.selectedCategoryOption) {
      case 'Default':
        this.data.manga = this.originalData.manga.filter((manga: { id: any;}) => {
          const item = this.library[manga.id];
  
          if (item == null) {
            console.log(`Manga with ID ${manga.id} could not be found in the library... It will not be displayed in the filtered response.`);
            return false;
          }
  
          return item.categories.length === 0;
        });
        break;
      
      case 'Unknown':
        this.data.manga = this.originalData.manga.filter((manga: { id: any;}) => {
          return this.library[manga.id] == null;
        });
        break;
      
      default:
        this.data.manga = this.originalData.manga.filter((manga: { id: any; }) => {
          const item = this.library[manga.id];
          return item == null ? false : item.categories.includes(this.selectedCategoryOption);
        })
        break;
    }
  }

  private filterBySource(): void {
    if (this.selectedSourceOption === '') return;
    
    this.data.manga = this.originalData.manga.filter((manga: any) => manga.sourceId === this.selectedSourceOption)
  }

  private listToMap<T extends Record<K, any>, K extends keyof any>(list: T[], key: K): Record<T[K], T> {
    return list.reduce((acc, item) => {
      acc[item[key]] = item;
      return acc;
    }, 
    {} as Record<T[K], T>);
  }
}
