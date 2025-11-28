import {Component, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {TaskDTO} from '../../core/models/task-model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserDTO} from '../../core/models/user-model';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {TasksApi} from '../../core/services/api/tasks-api';

@Component({
    selector: 'app-create-task-component',
    imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
],
    templateUrl: './create-task-component.html',
    styleUrl: './create-task-component.scss',
})
export class CreateTaskComponent {
    private readonly fb = inject(FormBuilder);
    private readonly tasksApi = inject(TasksApi);
    private readonly snackBar = inject(MatSnackBar);

    @Input() currentUser: UserDTO | undefined;
    @Output() taskCreated = new EventEmitter<void>();

    minDate = new Date(); // For datepicker minimum date

    // This lets us grab the stepper from the HTML to control it
    @ViewChild('stepper') stepper!: MatStepper;

    step1Group = this.fb.group({
        title: ['', Validators.required],
    });
    step2Group = this.fb.group({
        description: [''],
    });
    step3Group = this.fb.group({
        deadline: [null as Date | null, Validators.required],
        minPay: [null as number | null, [Validators.min(0)]],
        maxPay: [null as number | null, [Validators.min(0)]],
        maxBidsPerUser: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
    });

    public saveTask(): void {
        if (this.step1Group.invalid || !this.currentUser) {
            // Don't submit if form is invalid OR we don't know who the user is
            return;
        }

        const taskData: Partial<TaskDTO> = {
            title: this.step1Group.value.title || '',
            description: this.step2Group.value.description || '',
            posterUserId: this.currentUser.id,
            deadline: this.step3Group.value.deadline!,
            minPay: this.step3Group.value.minPay || undefined,
            maxPay: this.step3Group.value.maxPay || undefined,
            maxBidsPerUser: this.step3Group.value.maxBidsPerUser || 3,
        };

        this.tasksApi.createTask(taskData).subscribe({
            next: () => {
                // 1. Show the "toast"
                this.snackBar.open('Task posted successfully!', 'Close', {
                    duration: 3000, // 3 seconds
                });
                // 2. Reset the stepper
                this.stepper.reset(); // This resets the stepper UI
                this.step1Group.reset(); // This clears the form data
                this.step2Group.reset(); // This clears the form data
                this.step3Group.reset({maxBidsPerUser: 3}); // This clears the form data
                this.taskCreated.emit();
            },
            error: (err) => {
                console.error('Failed to create task', err);
                this.snackBar.open('Failed to post task. Please try again.', 'Close', {
                    duration: 5000,
                });
            },
        });
    }
}
